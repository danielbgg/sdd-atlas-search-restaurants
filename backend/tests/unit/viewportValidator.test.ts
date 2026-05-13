import { SearchQuerySchema } from '../../src/validation/search';

describe('SearchQuerySchema - Viewport Validator', () => {
  const validBase = {
    neLat: -23.5,
    neLng: -46.6,
    swLat: -23.7,
    swLng: -46.8,
  };

  it('accepts valid viewport params', () => {
    const result = SearchQuerySchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('coerces string numbers from query strings', () => {
    const result = SearchQuerySchema.safeParse({
      neLat: '-23.5',
      neLng: '-46.6',
      swLat: '-23.7',
      swLng: '-46.8',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.neLat).toBe(-23.5);
    }
  });

  it('rejects when neLat is not greater than swLat', () => {
    const result = SearchQuerySchema.safeParse({
      ...validBase,
      neLat: -23.8, // less than swLat
      swLat: -23.7,
    });
    expect(result.success).toBe(false);
  });

  it('rejects latitude out of range', () => {
    const result = SearchQuerySchema.safeParse({
      ...validBase,
      neLat: 95,
    });
    expect(result.success).toBe(false);
  });

  it('rejects longitude out of range', () => {
    const result = SearchQuerySchema.safeParse({
      ...validBase,
      neLng: -190,
    });
    expect(result.success).toBe(false);
  });

  it('applies default limit of 50', () => {
    const result = SearchQuerySchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it('rejects limit above 100', () => {
    const result = SearchQuerySchema.safeParse({ ...validBase, limit: 101 });
    expect(result.success).toBe(false);
  });

  it('accepts optional text query', () => {
    const result = SearchQuerySchema.safeParse({ ...validBase, q: 'pizza' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('pizza');
    }
  });

  it('accepts optional cuisine filter', () => {
    const result = SearchQuerySchema.safeParse({ ...validBase, cuisine: 'italiana' });
    expect(result.success).toBe(true);
  });

  it('rejects priceRange outside 1-4', () => {
    const result = SearchQuerySchema.safeParse({ ...validBase, priceRange: 5 });
    expect(result.success).toBe(false);
  });
});
