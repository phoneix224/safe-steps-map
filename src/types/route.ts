export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface SavedRoute {
  id: string;
  name: string;
  coordinates: Coordinate[];
  createdAt: number;
  distance: number; // in meters
  duration: number; // in milliseconds
}

export interface TrackingState {
  isTracking: boolean;
  isPaused: boolean;
  currentPath: Coordinate[];
  startTime: number | null;
}
