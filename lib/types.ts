import type { Timestamp } from "firebase/firestore";

export interface Trip {
  name: string;
  startDate: string;
  endDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  avatar: string;
  joinedAt: Timestamp;
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

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Meal {
  id: string;
  date: string;
  tripId: string;
  responsibleIds: string[];
  description: string;
  shoppingList: ShoppingItem[];
  updatedAt: Timestamp;
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
  accessCodes: { label: string; code: string }[];
  emergencyContacts: { name: string; phone: string; role: string }[];
  notes: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface WeatherData {
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  snowDepth: number;
  freezingLevel: number;
  fetchedAt: Timestamp;
}

export interface LocalUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  createdAt: number;
}
