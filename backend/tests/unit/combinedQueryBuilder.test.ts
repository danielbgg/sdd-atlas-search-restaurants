import { SearchQuerySchema } from '../../src/validation/search';

describe('Combined query builder', () => {
  const baseViewport = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
  };

  it('builds query with text + geo filters', () => {
    const result = SearchQuerySchema.safeParse({
      ...baseViewport,
      q: 'sushi',
      cuisine: 'japonesa',
      priceRange: '2',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('sushi');
      expect(result.data.cuisine).toBe('japonesa');
      expect(result.data.priceRange).toBe(2);
      expect(result.data.neLat).toBe(-23.5);
    }
  });

  it('builds query with geo only (no text)', () => {
    const result = SearchQuerySchema.safeParse(baseViewport);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBeUndefined();
      expect(result.data.cuisine).toBeUndefined();
      expect(result.data.priceRange).toBeUndefined();
    }
  });

  it('rejects invalid combination: invalid priceRange with valid text', () => {
    const result = SearchQuerySchema.safeParse({
      ...baseViewport,
      q: 'pizza',
      priceRange: '5',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all optional filters simultaneously', () => {
    const result = SearchQuerySchema.safeParse({
      ...baseViewport,
      q: 'japonês',
      cuisine: 'japonesa',
      priceRange: '3',
      limit: '20',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('japonês');
      expect(result.data.cuisine).toBe('japonesa');
      expect(result.data.priceRange).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });
});
