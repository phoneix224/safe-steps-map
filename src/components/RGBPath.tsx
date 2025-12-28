import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Coordinate } from '@/types/route';

interface RGBPathProps {
  path: Coordinate[];
  animate?: boolean;
}

// Generate rainbow colors based on position
const getRainbowColor = (progress: number): string => {
  // RGB rainbow: red -> orange -> yellow -> green -> cyan -> blue -> magenta
  const hue = progress * 360;
  return `hsl(${hue}, 100%, 55%)`;
};

const RGBPath = ({ path, animate = true }: RGBPathProps) => {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const animationRef = useRef<number>(0);

  const segments = useMemo(() => {
    if (path.length < 2) return [];
    
    const result: { start: [number, number]; end: [number, number]; color: string; index: number }[] = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const progress = i / (path.length - 1);
      result.push({
        start: [path[i].lat, path[i].lng],
        end: [path[i + 1].lat, path[i + 1].lng],
        color: getRainbowColor(progress),
        index: i,
      });
    }
    
    return result;
  }, [path]);

  useEffect(() => {
    if (!map || segments.length === 0) return;

    // Create layer group
    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    const layer = layerRef.current;
    layer.clearLayers();

    // Add colored segments
    segments.forEach(({ start, end, color }, idx) => {
      const polyline = L.polyline([start, end], {
        color: color,
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });
      
      // Add glow effect with another polyline
      const glow = L.polyline([start, end], {
        color: color,
        weight: 12,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      });
      
      layer.addLayer(glow);
      layer.addLayer(polyline);
    });

    // Animation for flowing effect
    if (animate && segments.length > 0) {
      let offset = 0;
      const animateColors = () => {
        layer.eachLayer((l) => {
          if (l instanceof L.Polyline) {
            const currentColor = (l.options as any).color;
            if (currentColor) {
              // Shift hue
              const match = currentColor.match(/hsl\((\d+)/);
              if (match) {
                const hue = (parseInt(match[1]) + 2) % 360;
                l.setStyle({ color: `hsl(${hue}, 100%, 55%)` });
              }
            }
          }
        });
        animationRef.current = requestAnimationFrame(animateColors);
      };

      animationRef.current = requestAnimationFrame(animateColors);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [map, segments, animate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (layerRef.current) {
        layerRef.current.clearLayers();
        layerRef.current.remove();
        layerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return null;
};

export default RGBPath;
