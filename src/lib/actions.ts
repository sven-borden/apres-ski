"use server";

import {
  pbCreate,
  pbDelete,
  pbFirst,
  pbList,
  pbUpdate,
  pbUpsertSingle,
} from "@/lib/pb/server";
import type {
  AttendanceRecord,
  BasecampRecord,
  MealRecord,
  ParticipantRecord,
  TripRecord,
} from "@/lib/pb/types";
import type { ShoppingItem } from "@/lib/feasts";
import type { EmergencyContact } from "@/lib/basecamp";

const GENERAL = "general";

function escape(v: string) {
  return v.replace(/"/g, '\\"');
}

/** Inclusive list of YYYY-MM-DD between start and end. */
function dateRange(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const d = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ── Trip ──────────────────────────────────────────────────────────────── */

export async function saveTrip(input: {
  name: string;
  startDate: string;
  endDate: string;
  updatedBy?: string;
}): Promise<TripRecord> {
  const trip = await pbUpsertSingle<TripRecord>("trips", input);
  // Seed an (empty) meal for every day in range + the general list. Idempotent.
  const dates = [...dateRange(input.startDate, input.endDate), GENERAL];
  for (const date of dates) {
    const existing = await pbFirst<MealRecord>("meals", { filter: `date="${escape(date)}"` });
    if (!existing) {
      await pbCreate("meals", {
        date,
        tripId: trip.id,
        responsibleIds: [],
        description: "",
        shoppingList: [],
        excludeFromShopping: false,
      });
    }
  }
  return trip;
}

/* ── Basecamp ──────────────────────────────────────────────────────────── */

export async function saveBasecamp(input: {
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
  updatedBy?: string;
}): Promise<BasecampRecord> {
  return pbUpsertSingle<BasecampRecord>("basecamp", input);
}

/* ── Participants ──────────────────────────────────────────────────────── */

export async function addParticipant(input: {
  name: string;
  color: string;
  avatar?: string;
  tripId?: string;
}): Promise<ParticipantRecord> {
  return pbCreate<ParticipantRecord>("participants", input);
}

export async function editParticipant(
  id: string,
  input: { name?: string; color?: string; avatar?: string },
): Promise<ParticipantRecord> {
  return pbUpdate<ParticipantRecord>("participants", id, input);
}

/* ── Attendance (presence-by-existence) ────────────────────────────────── */

export async function setAttendance(
  participantId: string,
  date: string,
  present: boolean,
): Promise<void> {
  const filter = `participantId="${escape(participantId)}" && date="${escape(date)}"`;
  const existing = await pbFirst<AttendanceRecord>("attendance", { filter });

  if (!present) {
    if (existing) await pbDelete("attendance", existing.id);
    return;
  }
  if (existing) {
    if (!existing.present) await pbUpdate("attendance", existing.id, { present: true });
    return;
  }
  const participant = await pbFirst<ParticipantRecord>("participants", {
    filter: `id="${escape(participantId)}"`,
  });
  await pbCreate("attendance", {
    participantId,
    participantName: participant?.name ?? "",
    participantColor: participant?.color ?? "",
    date,
    present: true,
  });
}

/* ── Meals ─────────────────────────────────────────────────────────────── */

async function findMeal(date: string): Promise<MealRecord | null> {
  return pbFirst<MealRecord>("meals", { filter: `date="${escape(date)}"` });
}

export async function saveDinner(
  date: string,
  input: { responsibleIds: string[]; description: string; updatedBy?: string },
): Promise<MealRecord> {
  const existing = await findMeal(date);
  return existing
    ? pbUpdate<MealRecord>("meals", existing.id, input)
    : pbCreate<MealRecord>("meals", { date, shoppingList: [], excludeFromShopping: false, ...input });
}

export async function saveShoppingList(
  date: string,
  shoppingList: ShoppingItem[],
  updatedBy?: string,
): Promise<MealRecord> {
  const existing = await findMeal(date);
  return existing
    ? pbUpdate<MealRecord>("meals", existing.id, { shoppingList, updatedBy })
    : pbCreate<MealRecord>("meals", {
        date,
        responsibleIds: [],
        description: "",
        shoppingList,
        excludeFromShopping: false,
        updatedBy,
      });
}

export async function setMealExcluded(date: string, excludeFromShopping: boolean): Promise<void> {
  const existing = await findMeal(date);
  if (existing) await pbUpdate("meals", existing.id, { excludeFromShopping });
}

/** Apply a checked/unchecked change to one item across many source dates. */
export async function setShoppingItemChecked(
  updates: { date: string; itemId: string; checked: boolean }[],
): Promise<void> {
  const byDate = new Map<string, string[]>();
  for (const u of updates) {
    const arr = byDate.get(u.date) ?? [];
    if (u.checked) arr.push(u.itemId);
    byDate.set(u.date, arr);
  }
  const allMeals = await pbList<MealRecord>("meals");
  for (const [date, checkedIds] of byDate) {
    const meal = allMeals.find((m) => m.date === date);
    if (!meal || meal.shoppingList === "") continue;
    const wanted = new Set(checkedIds);
    const next = (meal.shoppingList as ShoppingItem[]).map((it) =>
      updates.some((u) => u.date === date && u.itemId === it.id)
        ? { ...it, checked: wanted.has(it.id) }
        : it,
    );
    await pbUpdate("meals", meal.id, { shoppingList: next });
  }
}
