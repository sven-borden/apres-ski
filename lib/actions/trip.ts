import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

type UpdatableFields = Omit<Partial<Trip>, "updatedAt" | "createdAt">;

export async function updateTrip(fields: UpdatableFields) {
  const db = getDb();
  await setDoc(
    doc(db, "trips", "current"),
    {
      ...fields,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
