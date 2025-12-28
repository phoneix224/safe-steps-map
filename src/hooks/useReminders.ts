import { useState, useCallback, useEffect } from 'react';
import { Reminder } from '@/types/reminder';

const STORAGE_KEY = 'pathfinder_reminders';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReminders(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse reminders:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((items: Reminder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setReminders(items);
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isCompleted: false,
    };
    saveToStorage([...reminders, newReminder]);
    return newReminder;
  }, [reminders, saveToStorage]);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    const updated = reminders.map(r => r.id === id ? { ...r, ...updates } : r);
    saveToStorage(updated);
  }, [reminders, saveToStorage]);

  const deleteReminder = useCallback((id: string) => {
    saveToStorage(reminders.filter(r => r.id !== id));
  }, [reminders, saveToStorage]);

  const toggleComplete = useCallback((id: string) => {
    const updated = reminders.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    saveToStorage(updated);
  }, [reminders, saveToStorage]);

  // Check if user is near any reminder
  const checkNearbyReminders = useCallback((lat: number, lng: number) => {
    return reminders.filter(r => {
      if (r.isCompleted) return false;
      const distance = haversineDistance(lat, lng, r.location.lat, r.location.lng);
      return distance <= r.triggerRadius;
    });
  }, [reminders]);

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    checkNearbyReminders,
  };
};

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
