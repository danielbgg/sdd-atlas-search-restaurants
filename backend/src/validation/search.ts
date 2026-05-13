import { z } from 'zod';

export const SearchQuerySchema = z.object({
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cuisine: z.string().max(100).optional(),
  priceRange: z.coerce.number().int().min(1).max(4).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
}).refine(
  (data) => data.neLat > data.swLat,
  { message: 'neLat must be greater than swLat', path: ['neLat'] }
);

export const AutocompleteQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export const FacetsQuerySchema = z.object({
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
}).refine(
  (data) => data.neLat > data.swLat,
  { message: 'neLat must be greater than swLat', path: ['neLat'] }
);

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type AutocompleteQuery = z.infer<typeof AutocompleteQuerySchema>;
export type FacetsQuery = z.infer<typeof FacetsQuerySchema>;
