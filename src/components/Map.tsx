import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, Polyline } from 'react-leaflet';
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

// Generate rainbow color based on progress
const getRainbowColor = (progress: number): string => {
  const hue = progress * 360;
  return `hsl(${hue}, 100%, 55%)`;
};

const CurrentLocationMarker = ({ position }: { position: Coordinate }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return (
    <>
      {/* Pulse ring */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={25}
        pathOptions={{
          fillColor: '#e040fb',
          fillOpacity: 0.2,
          stroke: false,
        }}
      />
      {/* Glow ring */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={15}
        pathOptions={{
          fillColor: '#00e5ff',
          fillOpacity: 0.3,
          stroke: false,
        }}
      />
      {/* Center dot */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={8}
        pathOptions={{
          fillColor: '#00e5ff',
          fillOpacity: 1,
          color: '#0a0f14',
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
    if (!map) return;
    
    if (controlRef.current) {
      controlRef.current.remove();
    }

    const RecenterControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.innerHTML = `
          <button class="recenter-btn" style="
            width: 40px;
            height: 40px;
            background: hsl(220, 20%, 12%);
            border: 1px solid hsl(175, 85%, 50%, 0.3);
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 0 20px hsl(175, 85%, 50%, 0.2);
            color: hsl(175, 85%, 50%);
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

// RGB Path segments rendered inline using Polyline
const RGBPathSegments = ({ path }: { path: Coordinate[] }) => {
  if (path.length < 2) return null;
  
  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    const progress = i / (path.length - 1);
    const color = getRainbowColor(progress);
    const positions: [number, number][] = [
      [path[i].lat, path[i].lng],
      [path[i + 1].lat, path[i + 1].lng]
    ];
    
    segments.push(
      <Polyline
        key={`glow-${i}`}
        positions={positions}
        pathOptions={{
          color: color,
          weight: 12,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />,
      <Polyline
        key={`line-${i}`}
        positions={positions}
        pathOptions={{
          color: color,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    );
  }
  
  return <>{segments}</>;
};

// Saved path layer using Polyline
const SavedPathSegments = ({ path }: { path: Coordinate[] }) => {
  if (path.length < 2) return null;
  
  const positions: [number, number][] = path.map(c => [c.lat, c.lng]);
  
  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#00e5ff',
          weight: 10,
          opacity: 0.2,
        }}
      />
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#00e5ff',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }}
      />
    </>
  );
};

const Map = ({ center, currentPath, savedPath, currentPosition }: MapProps) => {
  const savedPathPositions = savedPath?.map(c => [c.lat, c.lng] as [number, number]) || [];

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="h-full w-full"
      zoomControl={false}
    >
      {/* Dark mode tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Saved route (if viewing) */}
      {savedPath && savedPath.length > 0 && (
        <>
          <SavedPathSegments path={savedPath} />
          {/* Start marker */}
          <CircleMarker
            center={savedPathPositions[0]}
            radius={12}
            pathOptions={{
              fillColor: '#00e5ff',
              fillOpacity: 1,
              color: '#0a0f14',
              weight: 3,
            }}
          />
          {/* End marker */}
          <CircleMarker
            center={savedPathPositions[savedPathPositions.length - 1]}
            radius={12}
            pathOptions={{
              fillColor: '#e040fb',
              fillOpacity: 1,
              color: '#0a0f14',
              weight: 3,
            }}
          />
        </>
      )}

      {/* Current tracking path with RGB colors */}
      {currentPath.length > 1 && (
        <>
          <RGBPathSegments path={currentPath} />
          
          {/* Start point */}
          <CircleMarker
            center={[currentPath[0].lat, currentPath[0].lng]}
            radius={12}
            pathOptions={{
              fillColor: '#00ff88',
              fillOpacity: 1,
              color: '#0a0f14',
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
