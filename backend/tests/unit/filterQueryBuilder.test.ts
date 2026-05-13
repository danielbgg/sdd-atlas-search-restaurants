import { SearchQuerySchema } from '../../src/validation/search';

describe('Filter query builder - cuisine and priceRange', () => {
  const baseViewport = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
  };

  it('accepts cuisine filter alone', () => {
    const result = SearchQuerySchema.safeParse({ ...baseViewport, cuisine: 'italiana' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cuisine).toBe('italiana');
    }
  });

  it('accepts priceRange filter alone', () => {
    const result = SearchQuerySchema.safeParse({ ...baseViewport, priceRange: '1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceRange).toBe(1);
    }
  });

  it('accepts both cuisine and priceRange together', () => {
    const result = SearchQuerySchema.safeParse({
      ...baseViewport,
      cuisine: 'mexicana',
      priceRange: '2',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cuisine).toBe('mexicana');
      expect(result.data.priceRange).toBe(2);
    }
  });

  it('rejects priceRange = 0', () => {
    const result = SearchQuerySchema.safeParse({ ...baseViewport, priceRange: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects priceRange = 5', () => {
    const result = SearchQuerySchema.safeParse({ ...baseViewport, priceRange: '5' });
    expect(result.success).toBe(false);
  });

  it('accepts all four priceRange valid values', () => {
    for (const pr of [1, 2, 3, 4]) {
      const result = SearchQuerySchema.safeParse({ ...baseViewport, priceRange: String(pr) });
      expect(result.success).toBe(true);
    }
  });
});
