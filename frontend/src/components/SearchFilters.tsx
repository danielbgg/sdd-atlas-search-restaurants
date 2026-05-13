import { useSearchSession } from '../state/searchSessionStore';

const CUISINES = [
  'brasileira', 'japonesa', 'italiana', 'francesa', 'árabe',
  'mexicana', 'peruana', 'portuguesa', 'chinesa', 'tailandesa',
  'indiana', 'americana', 'vegetariana',
];

const PRICE_RANGES = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

export default function SearchFilters(): JSX.Element {
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
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
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
          {PRICE_RANGES.map((p) => (
            <button
              key={p.value}
              className={`price-btn ${priceRange === p.value ? 'active' : ''}`}
              onClick={() => setFilterPriceRange(priceRange === p.value ? undefined : p.value)}
              data-testid={`price-btn-${p.value}`}
              title={`Preço: ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
