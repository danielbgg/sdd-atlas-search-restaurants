/**
 * Frontend integration tests for combined filter flow (US3)
 * Tests that geo + text filters coexist correctly in session state.
 */

import { renderHook, act } from '@testing-library/react';
import { SearchSessionProvider, useSearchSession } from '../../src/state/searchSessionStore';
import type { MapViewport } from '../../src/state/searchSessionStore';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SearchSessionProvider, null, children);

const mockViewport: MapViewport = {
  centerLat: -23.56,
  centerLng: -46.69,
  zoomLevel: 14,
  northEastLat: -23.50,
  northEastLng: -46.62,
  southWestLat: -23.62,
  southWestLng: -46.76,
};

describe('Integration: Combined Filter Flow (US3)', () => {
  it('holds viewport and text query simultaneously', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.setText('sushi');
    });

    expect(result.current.session.viewport).toEqual(mockViewport);
    expect(result.current.session.rawText).toBe('sushi');
  });

  it('resets loading state when new viewport is set with active text', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setText('pizza');
      result.current.setResults([{ id: 'r1', name: 'R1', location: { lat: -23.6, lng: -46.7 } }]);
    });

    act(() => {
      result.current.setViewport(mockViewport);
    });

    expect(result.current.session.status).toBe('loading');
    expect(result.current.session.rawText).toBe('pizza');
  });

  it('shows combined results after geo+text search completes', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.selectSuggestion({ id: 's1', name: 'Sushi Pinheiros' });
      result.current.setResults([
        { id: 'r1', name: 'Sushi Pinheiros', location: { lat: -23.56, lng: -46.69 }, scoreTextual: 0.9 },
      ]);
    });

    expect(result.current.session.status).toBe('success');
    expect(result.current.session.results[0].name).toBe('Sushi Pinheiros');
    expect(result.current.session.selectedSuggestion?.name).toBe('Sushi Pinheiros');
  });

  it('shows empty state when combined filters return no results', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.setText('xyz');
      result.current.setResults([]);
    });

    expect(result.current.session.status).toBe('empty');
    expect(result.current.session.results).toHaveLength(0);
  });
});
