import { useState, useEffect, useCallback } from 'react';
import { Coordinate } from '@/types/route';

interface GeolocationState {
  currentPosition: Coordinate | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    currentPosition: null,
    error: null,
    isLoading: true,
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      currentPosition: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: position.timestamp,
      },
      error: null,
      isLoading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unable to get location';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable GPS.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable. Check your GPS signal.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Try again.';
        break;
    }
    setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [updatePosition, handleError]);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { ...state, getCurrentPosition };
};

export const useWatchPosition = (onPositionUpdate: (coord: Coordinate) => void, isActive: boolean) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onPositionUpdate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isActive, onPositionUpdate]);

  return { error };
};
