/** Basecamp (chalet) types + the OpenStreetMap embed helper (PROJECT.md §2.6). */

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

/** OpenStreetMap no-key embed centred on the chalet, with a marker. */
export function osmEmbedUrl({ lat, lng }: { lat: number; lng: number }): string {
  const dx = 0.012;
  const dy = 0.007;
  const bbox = [lng - dx, lat - dy, lng + dx, lat + dy].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${lat},${lng}`;
}
