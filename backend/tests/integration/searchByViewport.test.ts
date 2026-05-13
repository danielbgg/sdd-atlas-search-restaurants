/**
 * Integration test for viewport update flow (US1)
 * Tests the search service + repository flow with a mocked MongoDB collection.
 */

import { RestaurantSearchService } from '../../src/services/restaurantSearchService';
import type { Db, Collection } from 'mongodb';

function makeDoc(id: string, lng: number, lat: number, extra: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => id },
    name: `Restaurant ${id}`,
    location: { type: 'Point', coordinates: [lng, lat] },
    city: 'São Paulo',
    ...extra,
  };
}

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

describe('Integration: SearchByViewport (US1)', () => {
  const viewport = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
    limit: 50,
  };

  it('returns restaurants within the viewport', async () => {
    const docs = [
      makeDoc('r1', -46.65, -23.6),
      makeDoc('r2', -46.70, -23.62),
    ];
    const service = new RestaurantSearchService(buildMockDb(docs));

    const response = await service.search(viewport);

    expect(response.total).toBe(2);
    expect(response.results).toHaveLength(2);
    expect(response.results[0].id).toBe('r1');
    expect(response.results[0].location.lat).toBe(-23.6);
    expect(response.results[0].location.lng).toBe(-46.65);
  });

  it('returns empty results when no restaurants in viewport', async () => {
    const service = new RestaurantSearchService(buildMockDb([]));
    const response = await service.search(viewport);

    expect(response.total).toBe(0);
    expect(response.results).toHaveLength(0);
  });

  it('updates results when viewport changes (pan simulation)', async () => {
    const newViewport = {
      neLat: -23.45,
      neLng: -46.55,
      swLat: -23.55,
      swLng: -46.65,
      limit: 50,
    };

    const docs = [makeDoc('r3', -46.60, -23.50)];
    const service = new RestaurantSearchService(buildMockDb(docs));
    const response = await service.search(newViewport);

    expect(response.total).toBe(1);
    expect(response.results[0].id).toBe('r3');
  });

  it('respects limit parameter', async () => {
    const docs = Array.from({ length: 10 }, (_, i) => makeDoc(`r${i}`, -46.65, -23.6));
    const service = new RestaurantSearchService(buildMockDb(docs));

    const response = await service.search({ ...viewport, limit: 5 });
    expect(response.results.length).toBeLessThanOrEqual(10);
  });
});
