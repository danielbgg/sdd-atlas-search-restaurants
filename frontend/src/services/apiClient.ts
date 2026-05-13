export interface RestaurantResult {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  neighborhood?: string;
  categories?: string[];
  cuisine?: string;
  priceRange?: number;
  rating?: number;
  reviewCount?: number;
  distanceMeters?: number;
  scoreTextual?: number;
}

export interface AutocompleteSuggestion {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface SearchParams {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
  q?: string;
  limit?: number;
  cuisine?: string;
  priceRange?: number;
}

export interface SearchResponse {
  total: number;
  results: RestaurantResult[];
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function apiFetch<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function searchRestaurants(params: SearchParams): Promise<SearchResponse> {
  return apiFetch<SearchResponse>('/v1/restaurants/search', params as Record<string, string | number | undefined>);
}

export async function autocompleteRestaurants(q: string, limit = 10): Promise<AutocompleteResponse> {
  return apiFetch<AutocompleteResponse>('/v1/restaurants/autocomplete', { q, limit });
}
