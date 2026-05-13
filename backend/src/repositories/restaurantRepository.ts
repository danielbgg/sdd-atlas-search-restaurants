import { Collection, Db } from 'mongodb';
import { RestaurantDocument, RestaurantResult, AutocompleteSuggestion, FacetBucket, FacetsResponse, documentToResult } from '../models/restaurant';
import type { SearchQuery, AutocompleteQuery, FacetsQuery } from '../validation/search';

export class RestaurantRepository {
  private collection: Collection<RestaurantDocument>;

  constructor(db: Db) {
    this.collection = db.collection<RestaurantDocument>('restaurants');
  }

  async findByViewport(query: SearchQuery): Promise<RestaurantResult[]> {
    const { neLat, neLng, swLat, swLng, limit, q, cuisine, priceRange } = query;

    // Use Atlas Search $search when text query or filters are provided
    if (q || cuisine || priceRange !== undefined) {
      return this.findByViewportWithSearch(query);
    }

    // Pure geospatial query with $geoWithin bounding box
    const filter: Record<string, unknown> = {
      location: {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat],
          ],
        },
      },
    };

    console.info('[MDB] find — coleção: restaurants');
    console.info('[MDB] filter:', JSON.stringify(filter, null, 2));
    console.info('[MDB] limit:', limit ?? 50);

    const docs = await this.collection
      .find(filter)
      .limit(limit ?? 50)
      .toArray();

    return docs.map(documentToResult);
  }

  private async findByViewportWithSearch(query: SearchQuery): Promise<RestaurantResult[]> {
    const { neLat, neLng, swLat, swLng, limit, q, cuisine, priceRange } = query;

    const mustClauses: unknown[] = [
      {
        geoWithin: {
          path: 'location',
          box: {
            bottomLeft: { type: 'Point', coordinates: [swLng, swLat] },
            topRight: { type: 'Point', coordinates: [neLng, neLat] },
          },
        },
      },
    ];

    if (q) {
      mustClauses.push({
        text: {
          query: q,
          path: 'name',
          fuzzy: { maxEdits: 2 },
        },
      });
    }

    const filterClauses: unknown[] = [];
    if (cuisine) {
      filterClauses.push({
        text: {
          query: cuisine,
          path: 'cuisine',
        },
      });
    }
    if (priceRange !== undefined) {
      filterClauses.push({
        equals: {
          path: 'priceRange',
          value: priceRange,
        },
      });
    }

    const searchStage: Record<string, unknown> = {
      $search: {
        index: 'default',
        compound: {
          must: mustClauses,
          ...(filterClauses.length > 0 ? { filter: filterClauses } : {}),
        },
      },
    };

    const pipeline = [
      searchStage,
      {
        $addFields: {
          scoreTextual: { $meta: 'searchScore' },
        },
      },
      { $limit: limit ?? 50 },
    ];

    console.info('[MDB] aggregate — coleção: restaurants (Atlas Search)');
    console.info('[MDB] pipeline:', JSON.stringify(pipeline, null, 2));

    const docs = await this.collection.aggregate<RestaurantDocument & { scoreTextual: number }>(pipeline).toArray();
    return docs.map(documentToResult);
  }

  async autocomplete(query: AutocompleteQuery): Promise<AutocompleteSuggestion[]> {
    const { q, limit } = query;

    const pipeline = [
      {
        $search: {
          index: 'default',
          autocomplete: {
            query: q,
            path: 'name',
            fuzzy: {
              maxEdits: 2,
              prefixLength: 1,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          score: { $meta: 'searchScore' },
        },
      },
      { $limit: limit ?? 10 },
    ];

    console.info('[MDB] aggregate — coleção: restaurants (autocomplete)');
    console.info('[MDB] pipeline:', JSON.stringify(pipeline, null, 2));

    const docs = await this.collection.aggregate<{
      _id: { toString(): string };
      name: string;
      location: { coordinates: [number, number] };
    }>(pipeline).toArray();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      lat: doc.location.coordinates[1],
      lng: doc.location.coordinates[0],
    }));
  }

  async getFacets(query: FacetsQuery): Promise<FacetsResponse> {
    const { neLat, neLng, swLat, swLng } = query;

    const pipeline = [
      {
        $searchMeta: {
          index: 'default',
          facet: {
            operator: {
              geoWithin: {
                path: 'location',
                box: {
                  bottomLeft: { type: 'Point', coordinates: [swLng, swLat] },
                  topRight: { type: 'Point', coordinates: [neLng, neLat] },
                },
              },
            },
            facets: {
              cuisineFacet: {
                type: 'string',
                path: 'cuisine',
                numBuckets: 50,
              },
              priceRangeFacet: {
                type: 'number',
                path: 'priceRange',
                boundaries: [1, 2, 3, 4, 5],
              },
            },
          },
        },
      },
    ];

    console.info('[MDB] aggregate — coleção: restaurants ($searchMeta facets)');
    console.info('[MDB] pipeline:', JSON.stringify(pipeline, null, 2));

    type FacetMeta = {
      facet: {
        cuisineFacet: { buckets: { _id: string; count: number }[] };
        priceRangeFacet: { buckets: { _id: number; count: number }[] };
      };
    };

    const [meta] = await this.collection
      .aggregate<FacetMeta>(pipeline)
      .toArray();

    if (!meta) {
      return { cuisines: [], priceRanges: [] };
    }

    const cuisines: FacetBucket[] = (meta.facet.cuisineFacet?.buckets ?? [])
      .filter((b) => b._id && b.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((b) => ({ value: b._id, count: b.count }));

    const PRICE_LABELS: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
    const priceRanges: FacetBucket[] = (meta.facet.priceRangeFacet?.buckets ?? [])
      .filter((b) => b._id >= 1 && b._id <= 4 && b.count > 0)
      .sort((a, b) => a._id - b._id)
      .map((b) => ({ value: PRICE_LABELS[b._id] ?? String(b._id), count: b.count }));

    return { cuisines, priceRanges };
  }
}
