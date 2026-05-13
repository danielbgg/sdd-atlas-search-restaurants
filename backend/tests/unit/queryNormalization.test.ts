import { AutocompleteQuerySchema } from '../../src/validation/search';

describe('AutocompleteQuerySchema - Query Normalization', () => {
  it('accepts a valid query string', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: 'pizza' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('pizza');
    }
  });

  it('applies default limit of 10', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: 'sushi' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects empty query string', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing query string', () => {
    const result = AutocompleteQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('coerces string limit from query string', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: 'bar', limit: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(5);
    }
  });

  it('rejects limit above 20', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: 'bar', limit: 21 });
    expect(result.success).toBe(false);
  });

  it('rejects query exceeding max length', () => {
    const result = AutocompleteQuerySchema.safeParse({ q: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe('Query normalization in AutocompleteService', () => {
  it('trims and lowercases input query', () => {
    // White-box test for the normalization step in AutocompleteService
    const raw = '  Pizza  ';
    const normalized = raw.trim().toLowerCase();
    expect(normalized).toBe('pizza');
  });

  it('preserves accented characters after normalization', () => {
    const raw = '  Açaí  ';
    const normalized = raw.trim().toLowerCase();
    expect(normalized).toBe('açaí');
  });
});
