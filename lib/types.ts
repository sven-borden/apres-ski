import type { Timestamp } from "firebase/firestore";

export interface Trip {
  name: string;
  startDate: string;
  endDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

export interface AperoAssignment {
  assignedTo: string;
  assignedParticipantId: string;
  notes: string;
  status: "unassigned" | "claimed" | "confirmed";
}

export interface DinnerAssignment {
  chefName: string;
  chefParticipantId: string;
  menu: string;
  dietaryTags: string[];
  status: "unassigned" | "claimed" | "confirmed";
}

export interface Meal {
  id: string;
  date: string;
  tripId: string;
  apero: AperoAssignment;
  dinner: DinnerAssignment;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface Basecamp {
  address: string;
  coordinates: { lat: number; lng: number };
  mapsUrl: string;
  wifi: { network: string; password: string };
  checkIn: string;
  checkOut: string;
  accessCodes: { label: string; code: string }[];
  emergencyContacts: { name: string; phone: string; role: string }[];
  notes: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface LocalUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  createdAt: number;
}
