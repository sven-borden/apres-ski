import { CAPACITY, TRIP_NAME, tripDays } from "./crew";
import { demoTrip } from "./demo";

/**
 * Placeholder basecamp + trip logistics. Swap for live PocketBase data later —
 * see PROJECT.md §2.6 (Basecamp) and §4.5 (Basecamp screen). Shapes mirror the
 * eventual records.
 */

export type EmergencyContact = { name: string; phone: string; role?: string };

export type Basecamp = {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  mapsUrl: string;
  wifi: { network: string; password: string };
  checkIn: string;
  checkOut: string;
  capacity: number;
  emergencyContacts: EmergencyContact[];
  notes: string;
  tricountUrl: string;
};

const lat = 46.0817;
const lng = 7.2336;

export const seedBasecamp: Basecamp = {
  name: "Chalet Edelweiss",
  address: "Route de la Tzoumaz 42\n1918 La Tzoumaz\nValais, Suisse",
  coordinates: { lat, lng },
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  wifi: { network: "Edelweiss_Guest", password: "PoudreUse2026!" },
  checkIn: "Sam. 16:00",
  checkOut: "Sam. 10:00",
  capacity: CAPACITY,
  emergencyContacts: [
    { name: "Secours en montagne", phone: "1414", role: "Urgences" },
    { name: "M. Fellay", phone: "+41 79 555 12 34", role: "Propriétaire" },
    { name: "Cabinet médical Verbier", phone: "+41 27 771 66 77", role: "Médecin" },
  ],
  notes:
    "Chaussures de ski au local à l'entrée, jamais dans le salon.\nPoubelles : tri au sous-sol, ramassage le mardi.\nDernier au lit éteint le sauna et baisse le chauffage à 17°C.\nParking : 2 places devant, les autres au parking communal (50 m).",
  tricountUrl: "https://tricount.com/fr/i/verbier-2026",
};

/** OpenStreetMap no-key embed centred on the chalet, with a marker. */
export function osmEmbedUrl({ lat, lng }: { lat: number; lng: number }): string {
  const dx = 0.012;
  const dy = 0.007;
  const bbox = [lng - dx, lat - dy, lng + dx, lat + dy].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat},${lng}`;
}

/** Trip facts shared with the rest of the app. */
export const seedTrip = {
  name: TRIP_NAME,
  startISO: tripDays[0],
  endISO: tripDays[tripDays.length - 1],
};

/** Dates that already have a cook assigned — used by the orphan-meal guard. */
export const assignedMealDates: string[] = demoTrip()
  .days.filter((d) => d.chefs.length > 0 || d.meal)
  .map((d) => d.date);
