/**
 * Frontend integration tests for autocomplete suggestion rendering (US2)
 * Tests state transitions when text input changes and suggestions are selected.
 */

import { renderHook, act } from '@testing-library/react';
import { SearchSessionProvider, useSearchSession } from '../../src/state/searchSessionStore';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SearchSessionProvider, null, children);

describe('Integration: Autocomplete Suggestions (US2)', () => {
  it('starts with empty rawText', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });
    expect(result.current.session.rawText).toBe('');
    expect(result.current.session.selectedSuggestion).toBeNull();
  });

  it('updates rawText when user types', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setText('pizza');
    });

    expect(result.current.session.rawText).toBe('pizza');
  });

  it('clears selectedSuggestion when user types new text', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.selectSuggestion({ id: 's1', name: 'Pizzaria Central' });
    });

    act(() => {
      result.current.setText('sushi');
    });

    expect(result.current.session.selectedSuggestion).toBeNull();
    expect(result.current.session.rawText).toBe('sushi');
  });

  it('sets selectedSuggestion when user picks from dropdown', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.selectSuggestion({ id: 's2', name: 'Sushi Bar' });
    });

    expect(result.current.session.selectedSuggestion).toEqual({
      id: 's2',
      name: 'Sushi Bar',
    });
    expect(result.current.session.status).toBe('loading');
  });

  it('can clear suggestion by passing null', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.selectSuggestion({ id: 's1', name: 'Test' });
    });

    act(() => {
      result.current.selectSuggestion(null);
    });

    expect(result.current.session.selectedSuggestion).toBeNull();
  });
});
