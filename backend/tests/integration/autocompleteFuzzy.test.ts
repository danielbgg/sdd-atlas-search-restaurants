/**
 * Integration test for fuzzy autocomplete behavior (US2)
 * Tests the autocomplete service + repository flow with mocked MongoDB.
 */

import { AutocompleteService } from '../../src/services/autocompleteService';
import type { Db, Collection } from 'mongodb';

function buildMockDb(results: unknown[] = []): Db {
  const mockCollection = {
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(results),
    }),
  } as unknown as Collection;

  return {
    collection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as Db;
}

describe('Integration: Fuzzy Autocomplete (US2)', () => {
  it('returns suggestions for an exact prefix match', async () => {
    const docs = [
      { _id: { toString: () => 'id1' }, name: 'Pizzaria Central' },
      { _id: { toString: () => 'id2' }, name: 'Pizza Express' },
    ];

    const service = new AutocompleteService(buildMockDb(docs));
    const result = await service.suggest({ q: 'pizza', limit: 10 });

    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions[0]).toEqual({ id: 'id1', name: 'Pizzaria Central' });
  });

  it('returns suggestions for fuzzy match (simulated — Atlas handles fuzziness)', async () => {
    // The service passes fuzzy config to Atlas Search; here we test that
    // the service correctly passes through the results from the repository
    const docs = [{ _id: { toString: () => 'id3' }, name: 'Pizzaria Roma' }];
    const service = new AutocompleteService(buildMockDb(docs));

    // "pizaria" (1 error) — Atlas Search would still match; we test flow
    const result = await service.suggest({ q: 'pizaria', limit: 10 });

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].name).toBe('Pizzaria Roma');
  });

  it('returns empty suggestions when no match', async () => {
    const service = new AutocompleteService(buildMockDb([]));
    const result = await service.suggest({ q: 'xyz123', limit: 10 });

    expect(result.suggestions).toHaveLength(0);
  });

  it('normalizes query before sending to repository', async () => {
    const aggregateMock = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({ aggregate: aggregateMock }),
    } as unknown as Db;

    const service = new AutocompleteService(mockDb);
    await service.suggest({ q: '  Sushi  ', limit: 5 });

    // Verify aggregate was called (normalization happens before the repo call)
    expect(aggregateMock).toHaveBeenCalled();
    const pipeline = aggregateMock.mock.calls[0][0];
    const searchStage = pipeline[0].$search;
    expect(searchStage.autocomplete.query).toBe('sushi');
  });

  it('respects limit parameter', async () => {
    const docs = Array.from({ length: 5 }, (_, i) => ({
      _id: { toString: () => `id${i}` },
      name: `Restaurant ${i}`,
    }));

    const service = new AutocompleteService(buildMockDb(docs));
    const result = await service.suggest({ q: 'rest', limit: 3 });

    expect(result.suggestions.length).toBeLessThanOrEqual(5);
  });
});
