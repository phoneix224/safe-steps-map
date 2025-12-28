import { useEffect, useRef } from 'react';
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
}

// Generate rainbow color based on progress
const getRainbowColor = (progress: number): string => {
  const hue = progress * 360;
  return `hsl(${hue}, 100%, 55%)`;
};

const Map = ({ center, currentPath, savedPath, currentPosition }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathLayersRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: center,
      zoom: 16,
      zoomControl: false,
    });

    // Dark mode tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    // Create layer groups
    pathLayersRef.current = L.layerGroup().addTo(mapRef.current);
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when position changes
  useEffect(() => {
    if (mapRef.current && currentPosition) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], mapRef.current.getZoom());
    }
  }, [currentPosition]);

  // Update paths and markers
  useEffect(() => {
    if (!mapRef.current || !pathLayersRef.current || !markersRef.current) return;

    // Clear existing layers
    pathLayersRef.current.clearLayers();
    markersRef.current.clearLayers();

    // Draw saved path
    if (savedPath && savedPath.length >= 2) {
      const savedPositions = savedPath.map(c => [c.lat, c.lng] as L.LatLngTuple);
      
      // Glow
      L.polyline(savedPositions, {
        color: '#00e5ff',
        weight: 10,
        opacity: 0.2,
      }).addTo(pathLayersRef.current);
      
      // Main line
      L.polyline(savedPositions, {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(pathLayersRef.current);

      // Start marker
      L.circleMarker(savedPositions[0], {
        radius: 12,
        fillColor: '#00e5ff',
        fillOpacity: 1,
        color: '#0a0f14',
        weight: 3,
      }).addTo(markersRef.current);

      // End marker
      L.circleMarker(savedPositions[savedPositions.length - 1], {
        radius: 12,
        fillColor: '#e040fb',
        fillOpacity: 1,
        color: '#0a0f14',
        weight: 3,
      }).addTo(markersRef.current);
    }

    // Draw current path with RGB colors
    if (currentPath.length >= 2) {
      for (let i = 0; i < currentPath.length - 1; i++) {
        const progress = i / (currentPath.length - 1);
        const color = getRainbowColor(progress);
        const segment: L.LatLngTuple[] = [
          [currentPath[i].lat, currentPath[i].lng],
          [currentPath[i + 1].lat, currentPath[i + 1].lng]
        ];

        // Glow
        L.polyline(segment, {
          color: color,
          weight: 12,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(pathLayersRef.current);

        // Main line
        L.polyline(segment, {
          color: color,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(pathLayersRef.current);
      }

      // Start point
      L.circleMarker([currentPath[0].lat, currentPath[0].lng], {
        radius: 12,
        fillColor: '#00ff88',
        fillOpacity: 1,
        color: '#0a0f14',
        weight: 3,
      }).addTo(markersRef.current);
    }

    // Current position marker
    if (currentPosition) {
      // Pulse ring
      L.circleMarker([currentPosition.lat, currentPosition.lng], {
        radius: 25,
        fillColor: '#e040fb',
        fillOpacity: 0.2,
        stroke: false,
      }).addTo(markersRef.current);

      // Glow ring
      L.circleMarker([currentPosition.lat, currentPosition.lng], {
        radius: 15,
        fillColor: '#00e5ff',
        fillOpacity: 0.3,
        stroke: false,
      }).addTo(markersRef.current);

      // Center dot
      L.circleMarker([currentPosition.lat, currentPosition.lng], {
        radius: 8,
        fillColor: '#00e5ff',
        fillOpacity: 1,
        color: '#0a0f14',
        weight: 3,
      }).addTo(markersRef.current);
    }
  }, [currentPath, savedPath, currentPosition]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default Map;