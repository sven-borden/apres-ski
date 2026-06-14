/**
 * Placeholder trip data so the foundation renders something real and on-brand.
 * Replace with live data (PocketBase) when the data layer lands — see PROJECT.md §7.
 */
import { CAPACITY } from "./crew";

export type DemoParticipant = { name: string; color: string };
export type DemoDay = {
  date: string; // YYYY-MM-DD
  present: DemoParticipant[];
  chefs: string[];
  meal: string | null;
};

const crew: DemoParticipant[] = [
  { name: "Léa", color: "oklch(0.62 0.17 46)" },
  { name: "Tom", color: "oklch(0.6 0.12 230)" },
  { name: "Marc", color: "oklch(0.58 0.11 150)" },
  { name: "Sofia", color: "oklch(0.55 0.15 330)" },
  { name: "Jo", color: "oklch(0.6 0.13 70)" },
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function demoTrip() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 12);

  const days: DemoDay[] = [
    { offset: 0, chefs: ["Léa"], meal: "Raclette + salade" },
    { offset: 1, chefs: ["Tom", "Marc"], meal: "Fondue moitié-moitié" },
    { offset: 2, chefs: [], meal: null },
    { offset: 3, chefs: ["Sofia"], meal: "Curry de saison" },
  ].map(({ offset, chefs, meal }) => {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    return {
      date: iso(d),
      present: crew.slice(0, 4 + (offset % 2)),
      chefs,
      meal,
    };
  });

  const end = new Date(start);
  end.setDate(start.getDate() + days.length - 1);

  return {
    name: "Verbier 2026",
    start,
    end,
    startISO: iso(start),
    endISO: iso(end),
    capacity: CAPACITY,
    crew,
    days,
  };
}

/** Whole days from local today until the trip start (negative = in progress / past). */
export function daysUntil(start: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}
