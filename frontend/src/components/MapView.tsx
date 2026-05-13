import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSearchSession } from '../state/searchSessionStore';
import type { MapViewport } from '../state/searchSessionStore';
import type { RestaurantResult } from '../services/apiClient';

// Fix for missing default marker icons in Webpack/Vite bundles
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// São Paulo center coordinates
const SAO_PAULO_CENTER: [number, number] = [-23.5505, -46.6333];
const DEFAULT_ZOOM = 13;

interface ViewportListenerProps {
  onViewportChange: (viewport: MapViewport) => void;
}

function ViewportListener({ onViewportChange }: ViewportListenerProps): null {
  const emitViewport = (m: ReturnType<typeof useMapEvents>): void => {
    const bounds = m.getBounds();
    const center = m.getCenter();
    const zoom = m.getZoom();
    const neLat = bounds.getNorthEast().lat;
    const swLat = bounds.getSouthWest().lat;
    if (neLat <= swLat) return; // bounds not yet calculated
    onViewportChange({
      centerLat: center.lat,
      centerLng: center.lng,
      zoomLevel: zoom,
      northEastLat: neLat,
      northEastLng: bounds.getNorthEast().lng,
      southWestLat: swLat,
      southWestLng: bounds.getSouthWest().lng,
    });
  };

  const map = useMapEvents({
    moveend: () => emitViewport(map),
    zoomend: () => emitViewport(map),
  });

  useEffect(() => {
    emitViewport(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

interface MapViewProps {
  restaurants: RestaurantResult[];
}

function FlyToController(): null {
  const map = useMap();
  const { session } = useSearchSession();
  const { focusedRestaurant } = session;
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedRestaurant) return;
    if (prevIdRef.current === focusedRestaurant.id) return;
    prevIdRef.current = focusedRestaurant.id;
    map.flyTo([focusedRestaurant.lat, focusedRestaurant.lng], 18, { duration: 1.2 });
  }, [focusedRestaurant, map]);

  return null;
}

export default function MapView({ restaurants }: MapViewProps): JSX.Element {
  const { setViewport } = useSearchSession();

  return (
    <div style={{ flex: 1, minHeight: 0 }} data-testid="map-container">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportListener onViewportChange={setViewport} />
        <FlyToController />
        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.location.lat, r.location.lng]}>
            <Popup>
              <strong>{r.name}</strong>
              {r.address && <><br />{r.address}</>}
              {r.cuisine && <><br /><em>{r.cuisine}</em></>}
              {r.rating !== undefined && <><br />⭐ {r.rating.toFixed(1)}</>}
              {r.priceRange !== undefined && <><br />{'$'.repeat(r.priceRange)}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
