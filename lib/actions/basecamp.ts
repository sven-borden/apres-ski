import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Basecamp } from "@/lib/types";

type UpdatableFields = Omit<Partial<Basecamp>, "updatedAt" | "updatedBy">;

export async function updateBasecamp(
  fields: UpdatableFields,
  updatedBy: string,
) {
  const db = getDb();
  await setDoc(
    doc(db, "basecamp", "current"),
    {
      ...fields,
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}
