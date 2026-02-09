import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getDateRange } from "@/lib/utils/dates";
import type { ShoppingItem } from "@/lib/types";

export async function seedMeals(startDate: string, endDate: string) {
  const db = getDb();
  const dates = getDateRange(startDate, endDate);

  await Promise.all(
    dates.map(async (date) => {
      const ref = doc(db, "meals", date);
      const snap = await getDoc(ref);
      if (snap.exists()) return;

      await setDoc(ref, {
        date,
        tripId: "current",
        responsibleIds: [],
        description: "",
        shoppingList: [],
        updatedAt: serverTimestamp(),
        updatedBy: "system",
      });
    }),
  );
}

export async function updateDinner(
  date: string,
  data: { responsibleIds: string[]; description: string },
  updatedBy: string,
) {
  const db = getDb();
  await setDoc(
    doc(db, "meals", date),
    {
      date,
      tripId: "current",
      responsibleIds: data.responsibleIds,
      description: data.description,
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}

export async function addShoppingItem(
  date: string,
  item: ShoppingItem,
  updatedBy: string,
) {
  const db = getDb();
  const ref = doc(db, "meals", date);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data().shoppingList ?? []) : [];

  await setDoc(
    ref,
    {
      shoppingList: [...current, item],
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}

export async function toggleShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  const db = getDb();
  const ref = doc(db, "meals", date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const list: ShoppingItem[] = snap.data().shoppingList ?? [];
  const updated = list.map((item) =>
    item.id === itemId ? { ...item, checked: !item.checked } : item,
  );

  await setDoc(
    ref,
    {
      shoppingList: updated,
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}

export async function removeShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  const db = getDb();
  const ref = doc(db, "meals", date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const list: ShoppingItem[] = snap.data().shoppingList ?? [];
  const updated = list.filter((item) => item.id !== itemId);

  await setDoc(
    ref,
    {
      shoppingList: updated,
      updatedAt: serverTimestamp(),
      updatedBy,
    },
    { merge: true },
  );
}
