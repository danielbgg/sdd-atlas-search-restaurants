import { useSearchSession } from '../state/searchSessionStore';
import type { FacetsResponse } from '../services/apiClient';

const PRICE_VALUE: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };

interface SearchFiltersProps {
  facets: FacetsResponse;
}

export default function SearchFilters({ facets }: SearchFiltersProps): JSX.Element {
  const { session, setFilterCuisine, setFilterPriceRange } = useSearchSession();
  const { cuisine, priceRange } = session.filters;

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
    </div>
  );
}
