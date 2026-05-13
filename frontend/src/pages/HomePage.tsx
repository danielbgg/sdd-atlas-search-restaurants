import { useEffect, useRef } from 'react';
import { SearchSessionProvider, useSearchSession } from '../state/searchSessionStore';
import { searchRestaurants } from '../services/apiClient';
import { useFacets } from '../hooks/useFacets';
import MapView from '../components/MapView';
import RestaurantResultsList from '../components/RestaurantResultsList';
import RestaurantSearchBox from '../components/RestaurantSearchBox';
import SearchFilters from '../components/SearchFilters';

function HomePageInner(): JSX.Element {
  const { session, setLoading, setResults, setError } = useSearchSession();
  const { viewport, selectedSuggestion, rawText, filters, status } = session;
  const abortRef = useRef<AbortController | null>(null);
  const facets = useFacets(viewport);

  useEffect(() => {
    if (!viewport) return;

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const query = selectedSuggestion?.name ?? rawText;

    setLoading();

    const params = {
      neLat: viewport.northEastLat,
      neLng: viewport.northEastLng,
      swLat: viewport.southWestLat,
      swLng: viewport.southWestLng,
      limit: 50,
      ...(query ? { q: query } : {}),
      ...(filters.cuisine ? { cuisine: filters.cuisine } : {}),
      ...(filters.priceRange !== undefined ? { priceRange: filters.priceRange } : {}),
      ...(filters.minRating !== undefined ? { minRating: filters.minRating } : {}),
    };

    searchRestaurants(params)
      .then((res) => {
        setResults(res.results);
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      });
  }, [viewport, selectedSuggestion, rawText, filters, setLoading, setResults, setError]);

  const hasActiveFilters = Boolean(
    rawText || selectedSuggestion || filters.cuisine || filters.priceRange !== undefined || filters.minRating !== undefined
  );

  return (
    <div className="home-page">
      <header className="app-header">
        <h1>🍽️ <span>Restaurantes</span> em SP</h1>
        <div className="header-controls">
          <RestaurantSearchBox />
          <SearchFilters facets={facets} />
        </div>
      </header>
      <main className="app-main">
        <div className="map-area">
          <MapView restaurants={status === 'success' ? session.results : []} />
        </div>
        <aside className="results-area">
          <RestaurantResultsList
            results={session.results}
            status={session.status}
            errorMessage={session.errorMessage}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>
      </main>
    </div>
  );
}

export default function HomePage(): JSX.Element {
  return (
    <SearchSessionProvider>
      <HomePageInner />
    </SearchSessionProvider>
  );
}
