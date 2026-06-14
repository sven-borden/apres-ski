import { PARTICIPANT_PALETTE } from "./palette";

/**
 * Placeholder crew + attendance, in sync with the Hub demo trip (start = today
 * + 12 days, 4 days long, capacity 6). Swap for live PocketBase data later —
 * see PROJECT.md §2.2–2.3, §4.4. Shapes mirror the eventual records.
 */

export type Participant = {
  id: string;
  name: string;
  color: string; // resolved OKLCH value
};

export const CAPACITY = 4;
export const TRIP_NAME = "Verbier 2026";

/** The identity stored on this device — toggling them skips confirmation. */
export const LOCAL_USER_ID = "p-lea";

const color = (id: string) =>
  PARTICIPANT_PALETTE.find((c) => c.id === id)!.value;

export const seedParticipants: Participant[] = [
  { id: "p-lea", name: "Léa", color: color("orange") },
  { id: "p-tom", name: "Tom", color: color("ice") },
  { id: "p-marc", name: "Marc", color: color("pine") },
  { id: "p-sofia", name: "Sofia", color: color("plum") },
  { id: "p-jo", name: "Jo", color: color("gold") },
];

function isoDay(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 12 + offset);
  return d.toISOString().slice(0, 10);
}

/** Inclusive trip days as YYYY-MM-DD. */
export const tripDays: string[] = [0, 1, 2, 3].map(isoDay);

/** Attendance is presence-by-existence: a present key `${pid}__${date}`. */
export function attendanceKey(participantId: string, date: string): string {
  return `${participantId}__${date}`;
}

/** Seed: most of the crew most days; a couple of late arrivals / early exits. */
export const seedAttendance: Set<string> = (() => {
  const present = new Set<string>();
  const [d0, d1, d2, d3] = tripDays;
  const all = seedParticipants.map((p) => p.id);
  // Everyone the first two nights.
  for (const d of [d0, d1]) for (const id of all) present.add(attendanceKey(id, d));
  // Day 3: Tom leaves early.
  for (const id of all.filter((i) => i !== "p-tom"))
    present.add(attendanceKey(id, d2));
  // Day 4: Sofia + Jo gone, Marc stays.
  for (const id of ["p-lea", "p-marc"]) present.add(attendanceKey(id, d3));
  return present;
})();

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

/** Stable roster order: by name, locale-aware. */
export function sortParticipants(list: Participant[]): Participant[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/** Count present for a given day across a roster + attendance set. */
export function headcount(date: string, attendance: Set<string>, roster: Participant[]): number {
  return roster.reduce(
    (n, p) => n + (attendance.has(attendanceKey(p.id, date)) ? 1 : 0),
    0,
  );
}
