// Timestamps are ISO 8601 strings (PocketBase autodate / datetime).
// Previously Firestore `Timestamp`; the UI never reads sub-fields, it only
// passes them through, so a plain string is sufficient.

export interface Trip {
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  avatar: string;
  joinedAt: string;
  tripId: string;
}

export interface Attendance {
  id: string;
  participantId: string;
  participantName: string;
  participantColor: string;
  date: string;
  present: boolean;
  tripId: string;
}

export type ShoppingUnit = "kg" | "g" | "L" | "dL" | "cl" | "pcs" | "bottles" | "packs";

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  quantity?: number;
  unit?: ShoppingUnit;
}

export interface Meal {
  id: string;
  date: string;
  tripId: string;
  responsibleIds: string[];
  description: string;
  shoppingList: ShoppingItem[];
  updatedAt: string;
  updatedBy: string;
}

export interface Basecamp {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  mapsUrl: string;
  wifi: { network: string; password: string };
  checkIn: string;
  checkOut: string;
  capacity: number;
  emergencyContacts: { name: string; phone: string; role: string }[];
  notes: string;
  tricountUrl: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WeatherData {
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  snowDepth: number;
  freezingLevel: number;
  fetchedAt: string;
}

export interface LocalUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  createdAt: number;
}
