import { useState } from 'react';
import { MapPin, Star, Clock, Navigation, Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { useRoutes } from '@/hooks/useRoutes';
import { formatDistance, formatDuration } from '@/hooks/useRoutes';

interface FavoritePlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visitCount: number;
  lastVisited: number;
  isFavorite: boolean;
}

const Places = () => {
  const { savedRoutes } = useRoutes();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Extract unique places from saved routes
  const visitedPlaces: FavoritePlace[] = savedRoutes.map((route, idx) => ({
    id: route.id,
    name: route.name,
    lat: route.coordinates[0]?.lat || 0,
    lng: route.coordinates[0]?.lng || 0,
    visitCount: 1,
    lastVisited: route.createdAt,
    isFavorite: favorites.includes(route.id),
  }));

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const favoriteRoutes = savedRoutes.filter(r => favorites.includes(r.id));
  const recentRoutes = [...savedRoutes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
          <Star className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg neon-text">My Places</h1>
          <p className="text-xs text-muted-foreground">
            {savedRoutes.length} saved route{savedRoutes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 bg-muted">
          <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-4">
          <TabsContent value="recent" className="m-0 px-4 pb-4">
            {recentRoutes.length === 0 ? (
              <EmptyState message="No recent routes" />
            ) : (
              <div className="space-y-3">
                {recentRoutes.map((route) => (
                  <PlaceCard
                    key={route.id}
                    route={route}
                    isFavorite={favorites.includes(route.id)}
                    onToggleFavorite={() => toggleFavorite(route.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="m-0 px-4 pb-4">
            {favoriteRoutes.length === 0 ? (
              <EmptyState message="No favorite routes yet" />
            ) : (
              <div className="space-y-3">
                {favoriteRoutes.map((route) => (
                  <PlaceCard
                    key={route.id}
                    route={route}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(route.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="m-0 px-4 pb-4">
            {savedRoutes.length === 0 ? (
              <EmptyState message="No saved routes" />
            ) : (
              <div className="space-y-3">
                {savedRoutes.map((route) => (
                  <PlaceCard
                    key={route.id}
                    route={route}
                    isFavorite={favorites.includes(route.id)}
                    onToggleFavorite={() => toggleFavorite(route.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <BottomNav />
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 text-muted-foreground card-glass rounded-xl">
    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
    <p>{message}</p>
    <p className="text-xs mt-1">Track and save routes to see them here</p>
  </div>
);

interface PlaceCardProps {
  route: any;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PlaceCard = ({ route, isFavorite, onToggleFavorite }: PlaceCardProps) => {
  const date = new Date(route.createdAt);
  
  return (
    <div className="card-glass rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground">{route.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 ${isFavorite ? 'text-accent' : 'text-muted-foreground'}`}
          onClick={onToggleFavorite}
        >
          {isFavorite ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Navigation className="h-4 w-4 text-primary" />
          <span>{formatDistance(route.distance)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4 text-accent" />
          <span>{formatDuration(route.duration)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4 text-secondary" />
          <span>{route.coordinates.length} pts</span>
        </div>
      </div>
    </div>
  );
};

export default Places;
