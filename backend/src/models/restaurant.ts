import { ObjectId } from 'mongodb';

export interface RestaurantDocument {
  _id?: ObjectId;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  neighborhood?: string;
  city: string;
  categories?: string[];
  cuisine?: string;
  priceRange?: number; // 1–4
  rating?: number; // 1.0–5.0
  reviewCount?: number;
  hours?: {
    open: string;
    close: string;
  };
}

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

export interface SearchQueryDTO {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
  q?: string;
  limit?: number;
  cuisine?: string;
  priceRange?: number;
}

export interface AutocompleteQueryDTO {
  q: string;
  limit?: number;
}

export interface SearchResponse {
  total: number;
  results: RestaurantResult[];
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface FacetsResponse {
  cuisines: FacetBucket[];
  priceRanges: FacetBucket[];
  ratingRanges: FacetBucket[];
}

export function documentToResult(doc: RestaurantDocument & { distanceMeters?: number; scoreTextual?: number }): RestaurantResult {
  return {
    id: doc._id!.toString(),
    name: doc.name,
    location: {
      lat: doc.location.coordinates[1],
      lng: doc.location.coordinates[0],
    },
    address: doc.address,
    neighborhood: doc.neighborhood,
    categories: doc.categories,
    cuisine: doc.cuisine,
    priceRange: doc.priceRange,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    distanceMeters: doc.distanceMeters,
    scoreTextual: doc.scoreTextual,
  };
}
