import { useState, useMemo } from 'react';
import { MapPin, Coffee, ShoppingBag, Utensils, Building2, Trees, Fuel, ParkingCircle, Hospital, GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { useGeolocation } from '@/hooks/useGeolocation';

interface PlaceCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const categories: PlaceCategory[] = [
  { id: 'restaurant', name: 'Restaurants', icon: Utensils, color: 'hsl(330, 85%, 60%)' },
  { id: 'cafe', name: 'Cafés', icon: Coffee, color: 'hsl(35, 85%, 55%)' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'hsl(280, 85%, 60%)' },
  { id: 'hotel', name: 'Hotels', icon: Building2, color: 'hsl(175, 85%, 50%)' },
  { id: 'park', name: 'Parks', icon: Trees, color: 'hsl(120, 85%, 50%)' },
  { id: 'gas', name: 'Gas Stations', icon: Fuel, color: 'hsl(0, 75%, 55%)' },
  { id: 'parking', name: 'Parking', icon: ParkingCircle, color: 'hsl(210, 85%, 55%)' },
  { id: 'hospital', name: 'Hospitals', icon: Hospital, color: 'hsl(0, 85%, 50%)' },
  { id: 'school', name: 'Schools', icon: GraduationCap, color: 'hsl(45, 85%, 55%)' },
];

// Simulated nearby places (in a real app, this would come from an API like Google Places)
const generateMockPlaces = (category: string, userLat: number, userLng: number) => {
  const places = [];
  const count = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    const distance = Math.sqrt(latOffset ** 2 + lngOffset ** 2) * 111000; // Rough meters
    
    places.push({
      id: `${category}-${i}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Place ${i + 1}`,
      type: category,
      lat: userLat + latOffset,
      lng: userLng + lngOffset,
      distance: Math.round(distance),
      rating: (Math.random() * 2 + 3).toFixed(1),
    });
  }
  
  return places.sort((a, b) => a.distance - b.distance);
};

const Explore = () => {
  const { currentPosition, isLoading, error } = useGeolocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const places = useMemo(() => {
    if (!selectedCategory || !currentPosition) return [];
    return generateMockPlaces(selectedCategory, currentPosition.lat, currentPosition.lng);
  }, [selectedCategory, currentPosition]);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery) return places;
    return places.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [places, searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handlePlaceClick = (place: any) => {
    toast.success(`Opening ${place.name} in maps...`);
    // In a real app, this would open the map or navigation
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background pb-20">
      {/* Header */}
      <header className="flex flex-col gap-4 px-4 py-4 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg neon-text">Explore Nearby</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Getting location...' : error ? 'Location unavailable' : 'Find places around you'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Categories */}
          <section>
            <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Categories</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/20 neon-border scale-105'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: cat.color + '22' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <span className="text-xs font-medium text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Places List */}
          {selectedCategory && (
            <section>
              <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">
                Nearby {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              
              {!currentPosition ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Enable location to see nearby places</p>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No places found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPlaces.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className="w-full card-glass rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{place.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {place.distance}m away • ⭐ {place.rating}
                          </p>
                        </div>
                        <div className="text-primary">
                          <MapPin className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {!selectedCategory && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a category to explore nearby places</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <BottomNav />
    </div>
  );
};

export default Explore;
