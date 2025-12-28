import { MapPin, Clock, Trash2, Navigation } from 'lucide-react';
import { SavedRoute } from '@/types/route';
import { formatDistance, formatDuration } from '@/hooks/useRoutes';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoutesListProps {
  routes: SavedRoute[];
  onSelectRoute: (route: SavedRoute) => void;
  onDeleteRoute: (id: string) => void;
  selectedRouteId?: string;
}

const RoutesList = ({ routes, onSelectRoute, onDeleteRoute, selectedRouteId }: RoutesListProps) => {
  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2">No saved routes yet</h3>
        <p className="text-muted-foreground text-sm max-w-[240px]">
          Start tracking your path and save it to see it here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] md:h-[400px]">
      <div className="space-y-3 p-1">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`card-glass rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              selectedRouteId === route.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectRoute(route)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-display font-semibold text-foreground">{route.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(route.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRoute(route.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>{formatDistance(route.distance)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(route.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{route.coordinates.length} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RoutesList;
