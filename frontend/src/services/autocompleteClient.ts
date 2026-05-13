import { autocompleteRestaurants } from './apiClient';
import type { AutocompleteSuggestion } from './apiClient';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function fetchSuggestionsDebounced(
  query: string,
  limit: number,
  onResult: (suggestions: AutocompleteSuggestion[]) => void,
  onError: (error: Error) => void,
  debounceMs = 300
): () => void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (!query.trim()) {
    onResult([]);
    return () => {};
  }

  debounceTimer = setTimeout(async () => {
    try {
      const response = await autocompleteRestaurants(query.trim(), limit);
      onResult(response.suggestions);
    } catch (err) {
      onError(err instanceof Error ? err : new Error('Autocomplete failed'));
    }
  }, debounceMs);

  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
}
