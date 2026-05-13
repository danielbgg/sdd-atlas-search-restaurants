import { useSearchSession } from '../state/searchSessionStore';
import type { FacetsResponse } from '../services/apiClient';

const PRICE_VALUE: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
const RATING_VALUE: Record<string, number> = { '★1+': 1, '★2+': 2, '★3+': 3, '★4+': 4, '★5': 5 };

interface SearchFiltersProps {
  facets: FacetsResponse;
}

export default function SearchFilters({ facets }: SearchFiltersProps): JSX.Element {
  const { session, setFilterCuisine, setFilterPriceRange, setFilterMinRating } = useSearchSession();
  const { cuisine, priceRange, minRating } = session.filters;

  return (
    <div className="search-filters" data-testid="search-filters">
      <div className="filter-group">
        <select
          id="cuisine-filter"
          className="filter-select"
          value={cuisine ?? ''}
          onChange={(e) => setFilterCuisine(e.target.value || undefined)}
          data-testid="cuisine-filter"
          title="Filtrar por culinária"
        >
          <option value="">Todas culinárias</option>
          {facets.cuisines.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value.charAt(0).toUpperCase() + c.value.slice(1)} ({c.count})
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <div className="price-buttons" data-testid="price-filter">
          <button
            className={`price-btn ${priceRange === undefined ? 'active' : ''}`}
            onClick={() => setFilterPriceRange(undefined)}
            title="Todos os preços"
          >
            Todos
          </button>
          {facets.priceRanges.map((p) => (
            <button
              key={p.value}
              className={`price-btn ${priceRange === PRICE_VALUE[p.value] ? 'active' : ''}`}
              onClick={() => {
                const val = PRICE_VALUE[p.value];
                setFilterPriceRange(priceRange === val ? undefined : val);
              }}
              data-testid={`price-btn-${PRICE_VALUE[p.value]}`}
              title={`Preço: ${p.value} (${p.count})`}
            >
              {p.value}
            </button>
          ))}
        </div>
      </div>
      {facets.ratingRanges.length > 0 && (
        <div className="filter-group">
          <div className="price-buttons" data-testid="rating-filter">
            <button
              className={`price-btn ${minRating === undefined ? 'active' : ''}`}
              onClick={() => setFilterMinRating(undefined)}
              title="Todas as avaliações"
            >
              ★ Todas
            </button>
            {facets.ratingRanges.map((r) => (
              <button
                key={r.value}
                className={`price-btn ${minRating === RATING_VALUE[r.value] ? 'active' : ''}`}
                onClick={() => {
                  const val = RATING_VALUE[r.value];
                  setFilterMinRating(minRating === val ? undefined : val);
                }}
                title={`Avaliação mínima ${r.value} (${r.count})`}
              >
                {r.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
