"use server";

import { getPb, TRIP_ID } from "@/lib/pb/server";
import { normalizeParticipant } from "@/lib/pb/normalize";
import type { Participant } from "@/lib/types";

// PocketBase generates the record id; callers store the returned id locally
// (the old client-generated UUID is not a valid PB id).
export async function createParticipant(data: {
  name: string;
  color: string;
  avatar: string;
}): Promise<Participant> {
  try {
    const pb = getPb();
    const rec = await pb.collection("participants").create({
      name: data.name,
      color: data.color,
      avatar: data.avatar,
      tripId: TRIP_ID,
    });
    return normalizeParticipant(rec);
  } catch (err) {
    console.error("Failed to create participant:", err);
    throw err;
  }
}

export async function updateParticipant(
  id: string,
  data: { name: string; color: string; avatar: string },
): Promise<void> {
  try {
    const pb = getPb();
    await pb.collection("participants").update(id, {
      name: data.name,
      color: data.color,
      avatar: data.avatar,
    });
  } catch (err) {
    console.error("Failed to update participant:", err);
    throw err;
  }
}
