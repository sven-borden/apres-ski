import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getDateRange } from "@/lib/utils/dates";
import type { ShoppingItem, ShoppingUnit } from "@/lib/types";

export async function seedMeals(startDate: string, endDate: string) {
  try {
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
  } catch (err) {
    console.error("Failed to seed meals:", err);
    throw err;
  }
}

export async function updateDinner(
  date: string,
  data: { responsibleIds: string[]; description: string },
  updatedBy: string,
) {
  try {
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
  } catch (err) {
    console.error("Failed to update dinner:", err);
    throw err;
  }
}

export async function addShoppingItem(
  date: string,
  item: ShoppingItem,
  updatedBy: string,
) {
  try {
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
  } catch (err) {
    console.error("Failed to add shopping item:", err);
    throw err;
  }
}

export async function toggleShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  try {
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
  } catch (err) {
    console.error("Failed to toggle shopping item:", err);
    throw err;
  }
}

export async function updateShoppingQuantities(
  date: string,
  estimates: { id: string; quantity: number | null; unit: ShoppingUnit | null }[],
  updatedBy: string,
) {
  try {
    const db = getDb();
    const ref = doc(db, "meals", date);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const list: ShoppingItem[] = snap.data().shoppingList ?? [];
    const estimateMap = new Map(estimates.map((e) => [e.id, e]));

    const updated = list.map((item) => {
      const est = estimateMap.get(item.id);
      if (!est || est.quantity == null) return item;
      return { ...item, quantity: est.quantity, unit: est.unit ?? undefined };
    });

    await setDoc(
      ref,
      {
        shoppingList: updated,
        updatedAt: serverTimestamp(),
        updatedBy,
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to update shopping quantities:", err);
    throw err;
  }
}

export async function removeShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  try {
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
  } catch (err) {
    console.error("Failed to remove shopping item:", err);
    throw err;
  }
}
