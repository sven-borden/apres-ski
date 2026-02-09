import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export async function claimApero(
  date: string,
  user: { id: string; name: string },
  notes: string,
) {
  const db = getDb();
  await setDoc(
    doc(db, "meals", date),
    {
      date,
      tripId: "current",
      apero: {
        assignedTo: user.name,
        assignedParticipantId: user.id,
        notes,
        status: "claimed",
      },
      updatedAt: serverTimestamp(),
      updatedBy: user.name,
    },
    { merge: true },
  );
}

export async function claimDinner(
  date: string,
  user: { id: string; name: string },
  menu: string,
  dietaryTags: string[],
) {
  const db = getDb();
  await setDoc(
    doc(db, "meals", date),
    {
      date,
      tripId: "current",
      dinner: {
        chefName: user.name,
        chefParticipantId: user.id,
        menu,
        dietaryTags,
        status: "claimed",
      },
      updatedAt: serverTimestamp(),
      updatedBy: user.name,
    },
    { merge: true },
  );
}

export async function updateMealDetails(
  date: string,
  section: "apero" | "dinner",
  fields: Record<string, unknown>,
  updatedBy: string,
) {
  const db = getDb();
  const update: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    updatedBy,
  };
  for (const [key, value] of Object.entries(fields)) {
    update[`${section}.${key}`] = value;
  }
  await setDoc(doc(db, "meals", date), update, { merge: true });
}

export async function unclaimMeal(
  date: string,
  section: "apero" | "dinner",
  updatedBy: string,
) {
  const db = getDb();
  const defaults =
    section === "apero"
      ? {
          apero: {
            assignedTo: "",
            assignedParticipantId: "",
            notes: "",
            status: "unassigned",
          },
        }
      : {
          dinner: {
            chefName: "",
            chefParticipantId: "",
            menu: "",
            dietaryTags: [],
            status: "unassigned",
          },
        };

  await setDoc(
    doc(db, "meals", date),
    {
      ...defaults,
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}
