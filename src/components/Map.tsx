import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinate } from '@/types/route';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  currentPath: Coordinate[];
  savedPath?: Coordinate[];
  currentPosition?: Coordinate | null;
  showBreadcrumbs?: boolean;
}

const CurrentLocationMarker = ({ position }: { position: Coordinate }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom());
  }, [position, map]);

  return (
    <>
      {/* Pulse ring */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={20}
        pathOptions={{
          fillColor: '#e68a00',
          fillOpacity: 0.2,
          stroke: false,
        }}
        className="pulse-ring"
      />
      {/* Center dot */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={8}
        pathOptions={{
          fillColor: '#e68a00',
          fillOpacity: 1,
          color: '#fff',
          weight: 3,
        }}
      />
    </>
  );
};

const RecenterButton = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.remove();
    }

    const RecenterControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.innerHTML = `
          <button class="recenter-btn" style="
            width: 34px;
            height: 34px;
            background: hsl(45 25% 95%);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          ">
            ◎
          </button>
        `;
        
        container.onclick = () => {
          map.setView(position, 17);
        };

        L.DomEvent.disableClickPropagation(container);
        return container;
      },
    });

    controlRef.current = new RecenterControl({ position: 'topright' });
    controlRef.current.addTo(map);

    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
      }
    };
  }, [map, position]);

  return null;
};

const Map = ({ center, currentPath, savedPath, currentPosition, showBreadcrumbs = true }: MapProps) => {
  const pathPositions = currentPath.map(c => [c.lat, c.lng] as [number, number]);
  const savedPathPositions = savedPath?.map(c => [c.lat, c.lng] as [number, number]) || [];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Saved route (if viewing) */}
      {savedPathPositions.length > 0 && (
        <>
          <Polyline
            positions={savedPathPositions}
            pathOptions={{
              color: '#2d6a4f',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
          {/* Start marker */}
          <CircleMarker
            center={savedPathPositions[0]}
            radius={10}
            pathOptions={{
              fillColor: '#2d6a4f',
              fillOpacity: 1,
              color: '#fff',
              weight: 3,
            }}
          />
          {/* End marker */}
          <CircleMarker
            center={savedPathPositions[savedPathPositions.length - 1]}
            radius={10}
            pathOptions={{
              fillColor: '#dc2626',
              fillOpacity: 1,
              color: '#fff',
              weight: 3,
            }}
          />
        </>
      )}

      {/* Current tracking path */}
      {pathPositions.length > 0 && (
        <>
          <Polyline
            positions={pathPositions}
            pathOptions={{
              color: '#e68a00',
              weight: 5,
              opacity: 0.9,
            }}
          />
          
          {/* Breadcrumb markers */}
          {showBreadcrumbs && pathPositions.length > 1 && 
            pathPositions.filter((_, i) => i % 5 === 0 && i !== 0).map((pos, idx) => (
              <CircleMarker
                key={idx}
                center={pos}
                radius={4}
                pathOptions={{
                  fillColor: '#e68a00',
                  fillOpacity: 0.8,
                  color: '#fff',
                  weight: 2,
                }}
              />
            ))
          }

          {/* Start point */}
          <CircleMarker
            center={pathPositions[0]}
            radius={10}
            pathOptions={{
              fillColor: '#2d6a4f',
              fillOpacity: 1,
              color: '#fff',
              weight: 3,
            }}
          />
        </>
      )}

      {/* Current position marker */}
      {currentPosition && (
        <CurrentLocationMarker position={currentPosition} />
      )}

      <RecenterButton position={center} />
    </MapContainer>
  );
};

export default Map;
