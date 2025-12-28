import { useState, useEffect, useCallback } from 'react';
import { SavedRoute, Coordinate } from '@/types/route';

const STORAGE_KEY = 'pathfinder-routes';

export const useRoutes = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedRoutes(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored routes');
      }
    }
  }, []);

  const saveRoute = useCallback((name: string, coordinates: Coordinate[], startTime: number) => {
    const distance = calculateDistance(coordinates);
    const duration = coordinates.length > 0 
      ? coordinates[coordinates.length - 1].timestamp - startTime 
      : 0;

    const newRoute: SavedRoute = {
      id: crypto.randomUUID(),
      name,
      coordinates,
      createdAt: Date.now(),
      distance,
      duration,
    };

    setSavedRoutes(prev => {
      const updated = [newRoute, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newRoute;
  }, []);

  const deleteRoute = useCallback((id: string) => {
    setSavedRoutes(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRoute = useCallback((id: string) => {
    return savedRoutes.find(r => r.id === id);
  }, [savedRoutes]);

  return { savedRoutes, saveRoute, deleteRoute, getRoute };
};

// Haversine formula for distance calculation
function calculateDistance(coordinates: Coordinate[]): number {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    totalDistance += haversine(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  return totalDistance;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
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

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
