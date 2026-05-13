/**
 * Integration test for combined text + geo filtering (US3)
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

describe('Integration: Combined Search (US3)', () => {
  const viewport = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
    limit: 50,
  };

  it('uses Atlas Search pipeline when q is provided with viewport', async () => {
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
    await service.search({ ...viewport, q: 'sushi' });

    expect(aggregateMock).toHaveBeenCalled();
    const pipeline = aggregateMock.mock.calls[0][0];
    const searchStage = pipeline[0].$search;
    expect(searchStage).toBeDefined();
    // Should contain both geo and text clauses
    const mustClauses = searchStage.compound.must;
    expect(mustClauses.some((c: Record<string, unknown>) => 'geoWithin' in c)).toBe(true);
    expect(mustClauses.some((c: Record<string, unknown>) => 'text' in c)).toBe(true);
  });

  it('uses $geoWithin find when no text query is provided', async () => {
    const findMock = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: findMock,
        aggregate: jest.fn(),
      }),
    } as unknown as Db;

    const service = new RestaurantSearchService(mockDb);
    await service.search(viewport);

    expect(findMock).toHaveBeenCalled();
  });

  it('returns combined results respecting both geo and text filters', async () => {
    const matchingDoc = {
      _id: { toString: () => 'r1' },
      name: 'Sushi Pinheiros',
      location: { type: 'Point', coordinates: [-46.69, -23.56] },
      city: 'São Paulo',
      scoreTextual: 0.95,
    };

    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([matchingDoc]),
        }),
      }),
    } as unknown as Db;

    const service = new RestaurantSearchService(mockDb);
    const result = await service.search({ ...viewport, q: 'sushi' });

    expect(result.total).toBe(1);
    expect(result.results[0].name).toBe('Sushi Pinheiros');
    expect(result.results[0].scoreTextual).toBe(0.95);
  });
});
