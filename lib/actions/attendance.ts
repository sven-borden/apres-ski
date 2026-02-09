import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export async function toggleAttendance(
  participant: { id: string; name: string; color: string },
  date: string,
  currentlyPresent: boolean,
) {
  const db = getDb();
  const docId = `${participant.id}_${date}`;
  const ref = doc(db, "attendance", docId);

  if (currentlyPresent) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      participantId: participant.id,
      participantName: participant.name,
      participantColor: participant.color,
      date,
      present: true,
      tripId: "current",
      updatedAt: serverTimestamp(),
    });
  }
}
