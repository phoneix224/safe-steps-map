import { Navigation, Clock, MapPin } from 'lucide-react';
import { Coordinate } from '@/types/route';
import { formatDistance, formatDuration } from '@/hooks/useRoutes';
import { useMemo } from 'react';

interface StatsBarProps {
  path: Coordinate[];
  startTime: number | null;
  isTracking: boolean;
}

const StatsBar = ({ path, startTime, isTracking }: StatsBarProps) => {
  const stats = useMemo(() => {
    if (path.length < 2) {
      return { distance: 0, duration: 0, points: path.length };
    }

    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      distance += haversine(
        path[i - 1].lat, path[i - 1].lng,
        path[i].lat, path[i].lng
      );
    }

    const duration = startTime ? Date.now() - startTime : 0;

    return { distance, duration, points: path.length };
  }, [path, startTime]);

  if (!isTracking && path.length === 0) return null;

  return (
    <div className="flex items-center justify-around py-3 px-4 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2">
        <Navigation className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="font-display font-semibold text-sm">{formatDistance(stats.distance)}</p>
        </div>
      </div>
      
      <div className="w-px h-8 bg-border" />
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="font-display font-semibold text-sm">{formatDuration(stats.duration)}</p>
        </div>
      </div>
      
      <div className="w-px h-8 bg-border" />
      
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Points</p>
          <p className="font-display font-semibold text-sm">{stats.points}</p>
        </div>
      </div>
    </div>
  );
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default StatsBar;
