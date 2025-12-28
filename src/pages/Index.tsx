import { useState, useCallback, useEffect } from 'react';
import { MapPin, List, X } from 'lucide-react';
import { toast } from 'sonner';
import Map from '@/components/Map';
import TrackingControls from '@/components/TrackingControls';
import RoutesList from '@/components/RoutesList';
import SaveRouteDialog from '@/components/SaveRouteDialog';
import StatsBar from '@/components/StatsBar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useGeolocation, useWatchPosition } from '@/hooks/useGeolocation';
import { useRoutes } from '@/hooks/useRoutes';
import { Coordinate, SavedRoute, TrackingState } from '@/types/route';

const Index = () => {
  const { currentPosition, error: geoError, isLoading } = useGeolocation();
  const { savedRoutes, saveRoute, deleteRoute } = useRoutes();
  
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isTracking: false,
    isPaused: false,
    currentPath: [],
    startTime: null,
  });
  
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRoutesList, setShowRoutesList] = useState(false);

  // Handle position updates during tracking
  const handlePositionUpdate = useCallback((coord: Coordinate) => {
    setTrackingState(prev => {
      if (!prev.isTracking || prev.isPaused) return prev;
      
      // Filter out duplicate positions (within 2 meters)
      const lastCoord = prev.currentPath[prev.currentPath.length - 1];
      if (lastCoord) {
        const distance = haversineDistance(
          lastCoord.lat, lastCoord.lng,
          coord.lat, coord.lng
        );
        if (distance < 2) return prev;
      }
      
      return {
        ...prev,
        currentPath: [...prev.currentPath, coord],
      };
    });
  }, []);

  // Watch position when tracking
  useWatchPosition(handlePositionUpdate, trackingState.isTracking && !trackingState.isPaused);

  const handleStartTracking = useCallback(() => {
    if (!currentPosition) {
      toast.error('Waiting for GPS signal...');
      return;
    }
    
    setSelectedRoute(null);
    setTrackingState({
      isTracking: true,
      isPaused: false,
      currentPath: [currentPosition],
      startTime: Date.now(),
    });
    toast.success('Tracking started! Walk around to record your path.');
  }, [currentPosition]);

  const handlePauseTracking = useCallback(() => {
    setTrackingState(prev => ({ ...prev, isPaused: true }));
    toast.info('Tracking paused');
  }, []);

  const handleResumeTracking = useCallback(() => {
    setTrackingState(prev => ({ ...prev, isPaused: false }));
    toast.success('Tracking resumed');
  }, []);

  const handleStopTracking = useCallback(() => {
    setTrackingState(prev => ({
      ...prev,
      isTracking: false,
      isPaused: false,
    }));
    
    if (trackingState.currentPath.length > 1) {
      toast.info('Route recorded. Save it to keep it!');
    }
  }, [trackingState.currentPath.length]);

  const handleSaveRoute = useCallback((name: string) => {
    if (trackingState.currentPath.length < 2) {
      toast.error('Not enough points to save');
      return;
    }
    
    saveRoute(name, trackingState.currentPath, trackingState.startTime || Date.now());
    setTrackingState(prev => ({ ...prev, currentPath: [] }));
    toast.success(`Route "${name}" saved!`);
  }, [trackingState.currentPath, trackingState.startTime, saveRoute]);

  const handleSelectRoute = useCallback((route: SavedRoute) => {
    setSelectedRoute(route);
    setShowRoutesList(false);
    setTrackingState(prev => ({ ...prev, currentPath: [] }));
    toast.success(`Viewing "${route.name}"`);
  }, []);

  const handleDeleteRoute = useCallback((id: string) => {
    deleteRoute(id);
    if (selectedRoute?.id === id) {
      setSelectedRoute(null);
    }
    toast.success('Route deleted');
  }, [deleteRoute, selectedRoute]);

  const handleClearSelectedRoute = useCallback(() => {
    setSelectedRoute(null);
  }, []);

  // Default center (will update when GPS is available)
  const mapCenter: [number, number] = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : [51.505, -0.09]; // London fallback

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">PathFinder</h1>
            <p className="text-xs text-muted-foreground">Never lose your way</p>
          </div>
        </div>

        <Sheet open={showRoutesList} onOpenChange={setShowRoutesList}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Routes</span>
              {savedRoutes.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {savedRoutes.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="font-display">Your Saved Routes</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <RoutesList
                routes={savedRoutes}
                onSelectRoute={handleSelectRoute}
                onDeleteRoute={handleDeleteRoute}
                selectedRouteId={selectedRoute?.id}
              />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Stats Bar */}
      <StatsBar
        path={trackingState.currentPath}
        startTime={trackingState.startTime}
        isTracking={trackingState.isTracking}
      />

      {/* Selected Route Banner */}
      {selectedRoute && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Viewing: {selectedRoute.name}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearSelectedRoute}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Getting your location...</p>
            </div>
          </div>
        ) : geoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Location Access Required</h3>
              <p className="text-muted-foreground text-sm">{geoError}</p>
            </div>
          </div>
        ) : (
          <Map
            center={mapCenter}
            currentPath={trackingState.currentPath}
            savedPath={selectedRoute?.coordinates}
            currentPosition={currentPosition}
          />
        )}

        {/* Tracking indicator */}
        {trackingState.isTracking && !trackingState.isPaused && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-glow animate-fade-in">
            <span className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
            Recording...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border pb-safe">
        <TrackingControls
          isTracking={trackingState.isTracking}
          isPaused={trackingState.isPaused}
          hasPath={trackingState.currentPath.length > 1}
          onStart={handleStartTracking}
          onPause={handlePauseTracking}
          onResume={handleResumeTracking}
          onStop={handleStopTracking}
          onSave={() => setShowSaveDialog(true)}
        />
      </div>

      {/* Save Dialog */}
      <SaveRouteDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveRoute}
      />
    </div>
  );
};

// Helper function
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export default Index;
