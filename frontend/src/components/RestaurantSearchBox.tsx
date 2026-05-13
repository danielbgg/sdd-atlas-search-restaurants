import { useState, useEffect, useRef } from 'react';
import { fetchSuggestionsDebounced } from '../services/autocompleteClient';
import { useSearchSession } from '../state/searchSessionStore';
import type { AutocompleteSuggestion } from '../services/apiClient';

export default function RestaurantSearchBox(): JSX.Element {
  const { session, setText, selectSuggestion, focusRestaurant } = useSearchSession();
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(session.rawText);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }

    cancelRef.current = fetchSuggestionsDebounced(
      inputValue,
      10,
      (newSuggestions) => {
        setSuggestions(newSuggestions);
        setShowDropdown(newSuggestions.length > 0);
      },
      (_err) => {
        setSuggestions([]);
        setShowDropdown(false);
      }
    );

    setText(inputValue);

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [inputValue, setText]);

  const handleSelect = (suggestion: AutocompleteSuggestion): void => {
    setInputValue(suggestion.name);
    setSuggestions([]);
    setShowDropdown(false);
    selectSuggestion(suggestion);
    focusRestaurant({ id: suggestion.id, lat: suggestion.lat, lng: suggestion.lng });
  };

  const handleClear = (): void => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    selectSuggestion(null);
    setText('');
  };

  return (
    <div className="search-box" data-testid="search-box">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar restaurante..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          aria-label="Buscar restaurante por nome"
          data-testid="search-input"
        />
        {inputValue && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Limpar busca"
            data-testid="search-clear"
          >
            ✕
          </button>
        )}
      </div>
      {showDropdown && (
        <ul className="suggestions-dropdown" data-testid="suggestions-dropdown" role="listbox">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="suggestion-item"
              data-testid="suggestion-item"
              role="option"
              onMouseDown={() => handleSelect(s)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
