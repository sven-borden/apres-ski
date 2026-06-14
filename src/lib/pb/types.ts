/** PocketBase record shapes (mirror pocketbase/pb_migrations schema). */
import type { ShoppingItem } from "@/lib/feasts";
import type { EmergencyContact } from "@/lib/basecamp";

type Base = { id: string; created?: string; updated?: string };

export type TripRecord = Base & {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BasecampRecord = Base & {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number } | "";
  mapsUrl: string;
  wifi: { network: string; password: string } | "";
  checkIn: string;
  checkOut: string;
  capacity: number;
  emergencyContacts: EmergencyContact[] | "";
  notes: string;
  tricountUrl: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type ParticipantRecord = Base & {
  name: string;
  color: string;
  avatar?: string;
  tripId?: string;
  joinedAt?: string;
};

export type AttendanceRecord = Base & {
  participantId: string;
  participantName?: string;
  participantColor?: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  tripId?: string;
};

export type MealRecord = Base & {
  date: string; // YYYY-MM-DD or "general"
  tripId?: string;
  responsibleIds: string[] | "";
  description: string;
  shoppingList: ShoppingItem[] | "";
  excludeFromShopping: boolean;
  updatedBy?: string;
  updatedAt?: string;
};

export type WeatherRecord = Base & {
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  snowDepth: number; // cm
  freezingLevel: number; // m
  fetchedAt?: string;
};
