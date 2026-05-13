import type { RestaurantResult } from '../services/apiClient';

interface RestaurantResultsListProps {
  results: RestaurantResult[];
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  errorMessage: string | null;
  hasActiveFilters: boolean;
}

function PriceTag({ priceRange }: { priceRange: number }): JSX.Element {
  return <span className="price-tag">{'$'.repeat(priceRange)}</span>;
}

export default function RestaurantResultsList({
  results,
  status,
  errorMessage,
  hasActiveFilters,
}: RestaurantResultsListProps): JSX.Element {
  if (status === 'idle') {
    return (
      <div className="results-state results-idle" data-testid="results-idle">
        <p>Mova o mapa para explorar restaurantes em São Paulo.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="results-state results-loading" data-testid="results-loading">
        <div className="spinner" aria-label="Carregando..." />
        <p>Buscando restaurantes...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="results-state results-error" data-testid="results-error">
        <p>Erro ao buscar restaurantes.</p>
        {errorMessage && <p className="error-detail">{errorMessage}</p>}
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="results-state results-empty" data-testid="results-empty">
        {hasActiveFilters ? (
          <p>Nenhum restaurante encontrado com os filtros ativos nessa área. Tente ajustar os filtros ou mover o mapa.</p>
        ) : (
          <p>Nenhum restaurante encontrado nessa área. Tente mover ou dar zoom no mapa.</p>
        )}
      </div>
    );
  }

  return (
    <div className="results-list" data-testid="results-list">
      <p className="results-count">{results.length} restaurante{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</p>
      <ul>
        {results.map((r) => (
          <li key={r.id} className="result-item" data-testid="result-item">
            <div className="result-header">
              <div className="result-name">{r.name}</div>
              {r.rating !== undefined && (
                <span className="result-rating">⭐ {r.rating.toFixed(1)}</span>
              )}
            </div>
            {r.address && <div className="result-address">{r.address}</div>}
            <div className="result-meta">
              {r.neighborhood && <span className="result-neighborhood">{r.neighborhood}</span>}
              {r.cuisine && <span className="result-cuisine">{r.cuisine}</span>}
              {r.priceRange !== undefined && <PriceTag priceRange={r.priceRange} />}
              {r.distanceMeters !== undefined && (
                <span className="result-distance">
                  {r.distanceMeters < 1000
                    ? `${Math.round(r.distanceMeters)}m`
                    : `${(r.distanceMeters / 1000).toFixed(1)}km`}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
