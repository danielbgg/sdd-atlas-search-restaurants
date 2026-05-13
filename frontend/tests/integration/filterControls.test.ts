/**
 * Frontend integration tests for filter controls UI state (US4)
 * Tests cuisine and priceRange filter state management.
 */

import { renderHook, act } from '@testing-library/react';
import { SearchSessionProvider, useSearchSession } from '../../src/state/searchSessionStore';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SearchSessionProvider, null, children);

describe('Integration: Filter Controls (US4)', () => {
  it('starts with no active filters', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    expect(result.current.session.filters.cuisine).toBeUndefined();
    expect(result.current.session.filters.priceRange).toBeUndefined();
  });

  it('sets cuisine filter and transitions to loading', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterCuisine('italiana');
    });

    expect(result.current.session.filters.cuisine).toBe('italiana');
    expect(result.current.session.status).toBe('loading');
  });

  it('clears cuisine filter by setting undefined', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterCuisine('japonesa');
    });

    act(() => {
      result.current.setFilterCuisine(undefined);
    });

    expect(result.current.session.filters.cuisine).toBeUndefined();
  });

  it('sets priceRange filter and transitions to loading', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterPriceRange(2);
    });

    expect(result.current.session.filters.priceRange).toBe(2);
    expect(result.current.session.status).toBe('loading');
  });

  it('clears priceRange filter by setting undefined', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterPriceRange(3);
    });

    act(() => {
      result.current.setFilterPriceRange(undefined);
    });

    expect(result.current.session.filters.priceRange).toBeUndefined();
  });

  it('applies both cuisine and priceRange simultaneously', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterCuisine('mexicana');
      result.current.setFilterPriceRange(2);
    });

    expect(result.current.session.filters.cuisine).toBe('mexicana');
    expect(result.current.session.filters.priceRange).toBe(2);
  });

  it('filters persist after viewport change', () => {
    const { result } = renderHook(() => useSearchSession(), { wrapper });

    act(() => {
      result.current.setFilterCuisine('brasileira');
      result.current.setFilterPriceRange(1);
    });

    act(() => {
      result.current.setViewport({
        centerLat: -23.55,
        centerLng: -46.65,
        zoomLevel: 13,
        northEastLat: -23.50,
        northEastLng: -46.60,
        southWestLat: -23.60,
        southWestLng: -46.70,
      });
    });

    expect(result.current.session.filters.cuisine).toBe('brasileira');
    expect(result.current.session.filters.priceRange).toBe(1);
  });
});
