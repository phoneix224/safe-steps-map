export interface Reminder {
  id: string;
  title: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  createdAt: number;
  triggerRadius: number; // in meters
  isCompleted: boolean;
  category: 'visit' | 'avoid' | 'note' | 'custom';
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance: number;
  icon: string;
}
