import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { RestaurantResult, AutocompleteSuggestion } from '../services/apiClient';

export interface MapViewport {
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
}

export interface ActiveFilters {
  cuisine?: string;
  priceRange?: number;
  minRating?: number;
}

export interface SearchSession {
  viewport: MapViewport | null;
  rawText: string;
  selectedSuggestion: AutocompleteSuggestion | null;
  focusedRestaurant: { id: string; lat: number; lng: number } | null;
  results: RestaurantResult[];
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  errorMessage: string | null;
  filters: ActiveFilters;
}

type Action =
  | { type: 'SET_VIEWPORT'; viewport: MapViewport }
  | { type: 'SET_TEXT'; rawText: string }
  | { type: 'SELECT_SUGGESTION'; suggestion: AutocompleteSuggestion | null }
  | { type: 'FOCUS_RESTAURANT'; restaurant: { id: string; lat: number; lng: number } | null }
  | { type: 'SET_LOADING' }
  | { type: 'SET_RESULTS'; results: RestaurantResult[] }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'SET_FILTER_CUISINE'; cuisine: string | undefined }
  | { type: 'SET_FILTER_PRICE_RANGE'; priceRange: number | undefined }
  | { type: 'SET_FILTER_MIN_RATING'; minRating: number | undefined };

function reducer(state: SearchSession, action: Action): SearchSession {
  switch (action.type) {
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport, status: 'loading' };
    case 'SET_TEXT':
      return { ...state, rawText: action.rawText, selectedSuggestion: null };
    case 'SELECT_SUGGESTION':
      return { ...state, selectedSuggestion: action.suggestion, status: 'loading' };
    case 'FOCUS_RESTAURANT':
      return { ...state, focusedRestaurant: action.restaurant };
    case 'SET_LOADING':
      return { ...state, status: 'loading', errorMessage: null };
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.results,
        status: action.results.length > 0 ? 'success' : 'empty',
        errorMessage: null,
      };
    case 'SET_ERROR':
      return { ...state, status: 'error', errorMessage: action.message, results: [] };
    case 'SET_FILTER_CUISINE':
      return { ...state, filters: { ...state.filters, cuisine: action.cuisine }, status: 'loading' };
    case 'SET_FILTER_PRICE_RANGE':
      return { ...state, filters: { ...state.filters, priceRange: action.priceRange }, status: 'loading' };
    case 'SET_FILTER_MIN_RATING':
      return { ...state, filters: { ...state.filters, minRating: action.minRating }, status: 'loading' };
    default:
      return state;
  }
}

const initialState: SearchSession = {
  viewport: null,
  rawText: '',
  selectedSuggestion: null,
  focusedRestaurant: null,
  results: [],
  status: 'idle',
  errorMessage: null,
  filters: {},
};

interface SearchSessionContextValue {
  session: SearchSession;
  setViewport: (viewport: MapViewport) => void;
  setText: (rawText: string) => void;
  selectSuggestion: (suggestion: AutocompleteSuggestion | null) => void;
  focusRestaurant: (restaurant: { id: string; lat: number; lng: number } | null) => void;
  setLoading: () => void;
  setResults: (results: RestaurantResult[]) => void;
  setError: (message: string) => void;
  setFilterCuisine: (cuisine: string | undefined) => void;
  setFilterPriceRange: (priceRange: number | undefined) => void;
  setFilterMinRating: (minRating: number | undefined) => void;
}

const SearchSessionContext = createContext<SearchSessionContextValue | null>(null);

export function SearchSessionProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, dispatch] = useReducer(reducer, initialState);

  const setViewport = useCallback((viewport: MapViewport) => dispatch({ type: 'SET_VIEWPORT', viewport }), []);
  const setText = useCallback((rawText: string) => dispatch({ type: 'SET_TEXT', rawText }), []);
  const selectSuggestion = useCallback((suggestion: AutocompleteSuggestion | null) => dispatch({ type: 'SELECT_SUGGESTION', suggestion }), []);
  const focusRestaurant = useCallback((restaurant: { id: string; lat: number; lng: number } | null) => dispatch({ type: 'FOCUS_RESTAURANT', restaurant }), []);
  const setLoading = useCallback(() => dispatch({ type: 'SET_LOADING' }), []);
  const setResults = useCallback((results: RestaurantResult[]) => dispatch({ type: 'SET_RESULTS', results }), []);
  const setError = useCallback((message: string) => dispatch({ type: 'SET_ERROR', message }), []);
  const setFilterCuisine = useCallback((cuisine: string | undefined) => dispatch({ type: 'SET_FILTER_CUISINE', cuisine }), []);
  const setFilterPriceRange = useCallback((priceRange: number | undefined) => dispatch({ type: 'SET_FILTER_PRICE_RANGE', priceRange }), []);
  const setFilterMinRating = useCallback((minRating: number | undefined) => dispatch({ type: 'SET_FILTER_MIN_RATING', minRating }), []);

  return (
    <SearchSessionContext.Provider value={{
      session,
      setViewport,
      setText,
      selectSuggestion,
      focusRestaurant,
      setLoading,
      setResults,
      setError,
      setFilterCuisine,
      setFilterPriceRange,
      setFilterMinRating,
    }}>
      {children}
    </SearchSessionContext.Provider>
  );
}

export function useSearchSession(): SearchSessionContextValue {
  const ctx = useContext(SearchSessionContext);
  if (!ctx) {
    throw new Error('useSearchSession must be used within SearchSessionProvider');
  }
  return ctx;
}
