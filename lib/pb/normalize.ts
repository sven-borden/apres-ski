import type {
  Trip,
  Participant,
  Attendance,
  Meal,
  Basecamp,
  WeatherData,
} from "@/lib/types";

// Pure normalizers from raw PocketBase records to typed app objects.
// Shared by the read route handlers (and safe to reuse anywhere). Timestamp
// fields are ISO strings (PocketBase autodate); the UI passes them through.

type Raw = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" ? v : fallback;

export function normalizeTrip(raw: Raw): Trip {
  return {
    name: str(raw.name),
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
    updatedBy: str(raw.updatedBy),
  };
}

export function normalizeParticipant(raw: Raw): Participant {
  return {
    id: str(raw.id),
    name: str(raw.name),
    color: str(raw.color),
    avatar: str(raw.avatar),
    joinedAt: str(raw.joinedAt),
    tripId: str(raw.tripId),
  };
}

export function normalizeAttendance(raw: Raw): Attendance {
  return {
    id: str(raw.id),
    participantId: str(raw.participantId),
    participantName: str(raw.participantName),
    participantColor: str(raw.participantColor),
    date: str(raw.date),
    present: typeof raw.present === "boolean" ? raw.present : false,
    tripId: str(raw.tripId),
  };
}

export function normalizeMeal(raw: Raw): Meal {
  return {
    id: str(raw.id),
    date: str(raw.date),
    tripId: str(raw.tripId, "current"),
    responsibleIds: Array.isArray(raw.responsibleIds)
      ? (raw.responsibleIds as string[])
      : [],
    description: str(raw.description),
    shoppingList: Array.isArray(raw.shoppingList) ? raw.shoppingList : [],
    updatedAt: str(raw.updatedAt),
    updatedBy: str(raw.updatedBy),
  };
}

export function normalizeBasecamp(raw: Raw): Basecamp {
  const coords = raw.coordinates as Raw | undefined;
  const wifi = raw.wifi as Raw | undefined;
  return {
    name: str(raw.name),
    address: str(raw.address),
    coordinates:
      coords && typeof coords.lat === "number" && typeof coords.lng === "number"
        ? { lat: coords.lat, lng: coords.lng }
        : { lat: 0, lng: 0 },
    mapsUrl: str(raw.mapsUrl),
    wifi:
      wifi &&
      typeof wifi.network === "string" &&
      typeof wifi.password === "string"
        ? { network: wifi.network, password: wifi.password }
        : { network: "", password: "" },
    checkIn: str(raw.checkIn),
    checkOut: str(raw.checkOut),
    capacity: num(raw.capacity),
    emergencyContacts: Array.isArray(raw.emergencyContacts)
      ? raw.emergencyContacts
      : [],
    notes: str(raw.notes),
    tricountUrl: str(raw.tricountUrl),
    updatedAt: str(raw.updatedAt),
    updatedBy: str(raw.updatedBy),
  };
}

export function normalizeWeather(raw: Raw): WeatherData {
  return {
    temperature: num(raw.temperature),
    temperatureMin: num(raw.temperatureMin),
    temperatureMax: num(raw.temperatureMax),
    weatherCode: num(raw.weatherCode),
    snowDepth: num(raw.snowDepth),
    freezingLevel: num(raw.freezingLevel),
    fetchedAt: str(raw.fetchedAt),
  };
}
