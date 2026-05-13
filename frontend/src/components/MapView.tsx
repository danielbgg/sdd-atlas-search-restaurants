import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      const zoom = map.getZoom();

      onViewportChange({
        centerLat: center.lat,
        centerLng: center.lng,
        zoomLevel: zoom,
        northEastLat: bounds.getNorthEast().lat,
        northEastLng: bounds.getNorthEast().lng,
        southWestLat: bounds.getSouthWest().lat,
        southWestLng: bounds.getSouthWest().lng,
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      const zoom = map.getZoom();

      onViewportChange({
        centerLat: center.lat,
        centerLng: center.lng,
        zoomLevel: zoom,
        northEastLat: bounds.getNorthEast().lat,
        northEastLng: bounds.getNorthEast().lng,
        southWestLat: bounds.getSouthWest().lat,
        southWestLng: bounds.getSouthWest().lng,
      });
    },
  });

  return null;
}

interface MapViewProps {
  restaurants: RestaurantResult[];
}

export default function MapView({ restaurants }: MapViewProps): JSX.Element {
  const { setViewport } = useSearchSession();
  const initialViewportSent = useRef(false);

  const handleViewportChange = (viewport: MapViewport): void => {
    setViewport(viewport);
    initialViewportSent.current = true;
  };

  return (
    <div style={{ flex: 1, minHeight: 0 }} data-testid="map-container">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        whenReady={(map) => {
          // Emit initial viewport on mount
          if (!initialViewportSent.current) {
            const bounds = map.target.getBounds();
            const center = map.target.getCenter();
            handleViewportChange({
              centerLat: center.lat,
              centerLng: center.lng,
              zoomLevel: DEFAULT_ZOOM,
              northEastLat: bounds.getNorthEast().lat,
              northEastLng: bounds.getNorthEast().lng,
              southWestLat: bounds.getSouthWest().lat,
              southWestLng: bounds.getSouthWest().lng,
            });
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportListener onViewportChange={handleViewportChange} />
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
