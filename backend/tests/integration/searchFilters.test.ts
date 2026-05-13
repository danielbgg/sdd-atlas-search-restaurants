/**
 * Integration test for cuisine + priceRange filtering (US4)
 */

import { RestaurantSearchService } from '../../src/services/restaurantSearchService';
import type { Db, Collection } from 'mongodb';

function buildMockDb(results: unknown[] = []): Db {
  const mockCollection = {
    find: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(results),
      }),
    }),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(results),
    }),
  } as unknown as Collection;

  return {
    collection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as Db;
}

describe('Integration: Cuisine and priceRange filters (US4)', () => {
  const viewport = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
    limit: 50,
  };

  it('uses aggregate pipeline when cuisine filter is provided', async () => {
    const aggregateMock = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        aggregate: aggregateMock,
      }),
    } as unknown as Db;

    const service = new RestaurantSearchService(mockDb);
    await service.search({ ...viewport, cuisine: 'italiana' });

    expect(aggregateMock).toHaveBeenCalled();
    const pipeline = aggregateMock.mock.calls[0][0];
    const searchStage = pipeline[0].$search;
    expect(searchStage.compound.filter).toBeDefined();
    const filterClauses = searchStage.compound.filter;
    expect(filterClauses.some((f: Record<string, unknown>) => 'text' in f)).toBe(true);
  });

  it('uses aggregate pipeline when priceRange filter is provided', async () => {
    const aggregateMock = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        aggregate: aggregateMock,
      }),
    } as unknown as Db;

    const service = new RestaurantSearchService(mockDb);
    await service.search({ ...viewport, priceRange: 2 });

    expect(aggregateMock).toHaveBeenCalled();
    const pipeline = aggregateMock.mock.calls[0][0];
    const filterClauses = pipeline[0].$search.compound.filter;
    expect(filterClauses.some((f: Record<string, unknown>) => 'equals' in f)).toBe(true);
  });

  it('combines cuisine + priceRange + text filters in a single pipeline', async () => {
    const aggregateMock = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        aggregate: aggregateMock,
      }),
    } as unknown as Db;

    const service = new RestaurantSearchService(mockDb);
    await service.search({ ...viewport, q: 'pizza', cuisine: 'italiana', priceRange: 2 });

    const pipeline = aggregateMock.mock.calls[0][0];
    const compound = pipeline[0].$search.compound;
    expect(compound.must).toBeDefined();
    expect(compound.filter).toBeDefined();
    expect(compound.must.some((c: Record<string, unknown>) => 'text' in c)).toBe(true);
    expect(compound.filter.some((f: Record<string, unknown>) => 'text' in f)).toBe(true);
    expect(compound.filter.some((f: Record<string, unknown>) => 'equals' in f)).toBe(true);
  });
});
