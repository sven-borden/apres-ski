"use server";

import PocketBase, { type RecordModel } from "pocketbase";
import { getPb, TRIP_ID } from "@/lib/pb/server";
import { getDateRange } from "@/lib/utils/dates";
import type { ShoppingItem, ShoppingUnit } from "@/lib/types";

// Meals previously used the date string as the doc id. PocketBase uses an auto
// id with a unique index on `date`, so we look meals up by date.
async function findMealByDate(
  pb: PocketBase,
  date: string,
): Promise<RecordModel | null> {
  try {
    return await pb
      .collection("meals")
      .getFirstListItem(pb.filter("date = {:date}", { date }));
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

async function updateShoppingList(
  date: string,
  updatedBy: string,
  transform: (list: ShoppingItem[]) => ShoppingItem[],
) {
  const pb = getPb();
  const meal = await findMealByDate(pb, date);
  if (!meal) return;
  const list: ShoppingItem[] = Array.isArray(meal.shoppingList)
    ? meal.shoppingList
    : [];
  await pb.collection("meals").update(meal.id, {
    shoppingList: transform(list),
    updatedBy,
  });
}

export async function seedMeals(startDate: string, endDate: string) {
  try {
    const pb = getPb();
    const dates = getDateRange(startDate, endDate);
    await Promise.all(
      dates.map(async (date) => {
        const existing = await findMealByDate(pb, date);
        if (existing) return;
        await pb.collection("meals").create({
          date,
          tripId: TRIP_ID,
          responsibleIds: [],
          description: "",
          shoppingList: [],
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
    const pb = getPb();
    const meal = await findMealByDate(pb, date);
    const payload = {
      date,
      tripId: TRIP_ID,
      responsibleIds: data.responsibleIds,
      description: data.description,
      updatedBy,
    };
    if (meal) {
      await pb.collection("meals").update(meal.id, payload);
    } else {
      await pb.collection("meals").create({ ...payload, shoppingList: [] });
    }
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
    await updateShoppingList(date, updatedBy, (list) => [...list, item]);
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
    await updateShoppingList(date, updatedBy, (list) =>
      list.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
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
    const estimateMap = new Map(estimates.map((e) => [e.id, e]));
    await updateShoppingList(date, updatedBy, (list) =>
      list.map((item) => {
        const est = estimateMap.get(item.id);
        if (!est || est.quantity == null) return item;
        return { ...item, quantity: est.quantity, unit: est.unit ?? undefined };
      }),
    );
  } catch (err) {
    console.error("Failed to update shopping quantities:", err);
    throw err;
  }
}

export async function resetShoppingQuantities(date: string, updatedBy: string) {
  try {
    await updateShoppingList(date, updatedBy, (list) =>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      list.map(({ quantity, unit, ...rest }) => rest),
    );
  } catch (err) {
    console.error("Failed to reset shopping quantities:", err);
    throw err;
  }
}

export async function updateSingleItemQuantity(
  date: string,
  itemId: string,
  quantity: number | null,
  unit: ShoppingUnit | null,
  updatedBy: string,
) {
  try {
    await updateShoppingList(date, updatedBy, (list) =>
      list.map((item) => {
        if (item.id !== itemId) return item;
        if (quantity == null) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { quantity: _q, unit: _u, ...rest } = item;
          return rest;
        }
        return { ...item, quantity, unit: unit ?? undefined };
      }),
    );
  } catch (err) {
    console.error("Failed to update single item quantity:", err);
    throw err;
  }
}

export async function removeShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  try {
    await updateShoppingList(date, updatedBy, (list) =>
      list.filter((item) => item.id !== itemId),
    );
  } catch (err) {
    console.error("Failed to remove shopping item:", err);
    throw err;
  }
}
