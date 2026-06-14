"use server";

import { getPb, TRIP_DOC_ID } from "@/lib/pb/server";
import type { Trip } from "@/lib/types";

type UpdatableFields = Omit<
  Partial<Trip>,
  "updatedAt" | "createdAt" | "updatedBy"
>;

export async function updateTrip(fields: UpdatableFields, updatedBy: string) {
  try {
    const pb = getPb();
    const payload = { ...fields, updatedBy };
    try {
      await pb.collection("trips").update(TRIP_DOC_ID, payload);
    } catch (err) {
      if ((err as { status?: number }).status === 404) {
        await pb.collection("trips").create({ id: TRIP_DOC_ID, ...payload });
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("Failed to update trip:", err);
    throw err;
  }
}
