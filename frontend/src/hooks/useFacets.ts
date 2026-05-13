import { useState, useEffect, useRef } from 'react';
import { fetchFacets } from '../services/apiClient';
import type { FacetsResponse, FacetsParams } from '../services/apiClient';

const EMPTY: FacetsResponse = { cuisines: [], priceRanges: [], ratingRanges: [] };
const DEBOUNCE_MS = 400;

export function useFacets(viewport: FacetsParams | null): FacetsResponse {
  const [facets, setFacets] = useState<FacetsResponse>(EMPTY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!viewport) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      fetchFacets(viewport)
        .then(setFacets)
        .catch(() => { /* silently keep previous facets on error */ });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [viewport?.neLat, viewport?.neLng, viewport?.swLat, viewport?.swLng]); // eslint-disable-line react-hooks/exhaustive-deps

  return facets;
}
