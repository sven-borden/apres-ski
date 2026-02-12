import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

type UpdatableFields = Omit<Partial<Trip>, "updatedAt" | "createdAt" | "updatedBy">;

export async function updateTrip(fields: UpdatableFields, updatedBy: string) {
  try {
    const db = getDb();
    await setDoc(
      doc(db, "trips", "current"),
      {
        ...fields,
        updatedAt: serverTimestamp(),
        updatedBy,
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to update trip:", err);
    throw err;
  }
}
