"use server";

import { getPb, TRIP_ID } from "@/lib/pb/server";

// Attendance has a unique index on (participantId, date). Presence is modeled
// as the existence of a record: toggling on creates it, toggling off deletes it.
export async function toggleAttendance(
  participant: { id: string; name: string; color: string },
  date: string,
  currentlyPresent: boolean,
) {
  try {
    const pb = getPb();
    const filter = pb.filter("participantId = {:pid} && date = {:date}", {
      pid: participant.id,
      date,
    });

    if (currentlyPresent) {
      try {
        const rec = await pb.collection("attendance").getFirstListItem(filter);
        await pb.collection("attendance").delete(rec.id);
      } catch (err) {
        if ((err as { status?: number }).status !== 404) throw err;
      }
    } else {
      await pb.collection("attendance").create({
        participantId: participant.id,
        participantName: participant.name,
        participantColor: participant.color,
        date,
        present: true,
        tripId: TRIP_ID,
      });
    }
  } catch (err) {
    console.error("Failed to toggle attendance:", err);
    throw err;
  }
}
