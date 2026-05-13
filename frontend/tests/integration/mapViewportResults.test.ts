/**
 * Frontend integration tests for map viewport → results flow (US1)
 * Tests that the SearchSession state updates correctly in response to viewport changes.
 */

import { renderHook, act } from '@testing-library/react';
import { SearchSessionProvider, useSearchSession } from '../../src/state/searchSessionStore';
import type { MapViewport } from '../../src/state/searchSessionStore';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SearchSessionProvider, null, children);

const mockViewport: MapViewport = {
  centerLat: -23.6,
  centerLng: -46.7,
  zoomLevel: 13,
  northEastLat: -23.5,
  northEastLng: -46.6,
  southWestLat: -23.7,
  southWestLng: -46.8,
};

describe('Integration: MapViewport → Results (US1)', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });
    expect(result.current.session.status).toBe('idle');
    expect(result.current.session.viewport).toBeNull();
  });

  it('transitions to loading when viewport is set', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
    });

    expect(result.current.session.status).toBe('loading');
    expect(result.current.session.viewport).toEqual(mockViewport);
  });

  it('transitions to success when results are set', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.setResults([
        {
          id: 'r1',
          name: 'Restaurante A',
          location: { lat: -23.6, lng: -46.7 },
        },
      ]);
    });

    expect(result.current.session.status).toBe('success');
    expect(result.current.session.results).toHaveLength(1);
  });

  it('transitions to empty when setResults([]) is called', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.setResults([]);
    });

    expect(result.current.session.status).toBe('empty');
    expect(result.current.session.results).toHaveLength(0);
  });

  it('transitions to error state', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
      result.current.setError('Connection refused');
    });

    expect(result.current.session.status).toBe('error');
    expect(result.current.session.errorMessage).toBe('Connection refused');
  });

  it('updates viewport when pan is simulated', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setViewport(mockViewport);
    });

    const newViewport: MapViewport = { ...mockViewport, centerLat: -23.55 };
    act(() => {
      result.current.setViewport(newViewport);
    });

    expect(result.current.session.viewport?.centerLat).toBe(-23.55);
  });
});
