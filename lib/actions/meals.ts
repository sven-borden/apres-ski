"use server";

import PocketBase, { type RecordModel } from "pocketbase";
import { getPb, TRIP_ID } from "@/lib/pb/server";
import { getDateRange } from "@/lib/utils/dates";
import type { ShoppingItem, ShoppingUnit } from "@/lib/types";

// Meals previously used the date string as the doc id. PocketBase uses an auto
// id with a unique index on `date`, so we look meals up by date. The special
// date "general" holds trip-wide shopping items not tied to a day.
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

// Reads the meal's current shopping list, applies `transform`, and writes it
// back. No-op if the meal doesn't exist.
async function mutateShoppingList(
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

async function upsertMeal(
  pb: PocketBase,
  date: string,
  data: Record<string, unknown>,
) {
  const meal = await findMealByDate(pb, date);
  if (meal) {
    await pb.collection("meals").update(meal.id, data);
  } else {
    await pb.collection("meals").create({
      date,
      tripId: TRIP_ID,
      responsibleIds: [],
      description: "",
      shoppingList: [],
      ...data,
    });
  }
}

export async function ensureGeneralMeal() {
  try {
    const pb = getPb();
    const meal = await findMealByDate(pb, "general");
    if (!meal) {
      await pb.collection("meals").create({
        date: "general",
        tripId: TRIP_ID,
        responsibleIds: [],
        description: "",
        shoppingList: [],
        updatedBy: "system",
      });
    } else if (!meal.tripId) {
      await pb.collection("meals").update(meal.id, { tripId: TRIP_ID });
    }
  } catch (err) {
    console.error("Failed to ensure general meal:", err);
  }
}

export async function seedMeals(startDate: string, endDate: string) {
  try {
    const pb = getPb();
    const dates = getDateRange(startDate, endDate);

    await Promise.all([
      ...dates.map(async (date) => {
        if (await findMealByDate(pb, date)) return;
        await pb.collection("meals").create({
          date,
          tripId: TRIP_ID,
          responsibleIds: [],
          description: "",
          shoppingList: [],
          updatedBy: "system",
        });
      }),
      // Seed the general shopping list doc (trip-wide items).
      (async () => {
        if (await findMealByDate(pb, "general")) return;
        await pb.collection("meals").create({
          date: "general",
          tripId: TRIP_ID,
          responsibleIds: [],
          description: "",
          shoppingList: [],
          updatedBy: "system",
        });
      })(),
    ]);
  } catch (err) {
    console.error("Failed to seed meals:", err);
    throw err;
  }
}

export async function toggleExcludeFromShopping(
  date: string,
  excludeFromShopping: boolean,
  updatedBy: string,
) {
  try {
    const pb = getPb();
    await upsertMeal(pb, date, { excludeFromShopping, updatedBy });
  } catch (err) {
    console.error("Failed to toggle exclude from shopping:", err);
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
    await upsertMeal(pb, date, {
      responsibleIds: data.responsibleIds,
      description: data.description,
      updatedBy,
    });
  } catch (err) {
    console.error("Failed to update dinner:", err);
    throw err;
  }
}

export async function addShoppingItem(
  date: string,
  item: ShoppingItem | ShoppingItem[],
  updatedBy: string,
) {
  try {
    const newItems = Array.isArray(item) ? item : [item];
    await mutateShoppingList(date, updatedBy, (list) => [...list, ...newItems]);
  } catch (err) {
    console.error("Failed to add shopping item:", err);
    throw err;
  }
}

export async function toggleShoppingItem(
  date: string,
  itemId: string,
  checked: boolean,
  items: ShoppingItem[],
  updatedBy: string,
) {
  try {
    const pb = getPb();
    const meal = await findMealByDate(pb, date);
    if (!meal) return;
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, checked } : item,
    );
    await pb.collection("meals").update(meal.id, {
      shoppingList: updated,
      updatedBy,
    });
  } catch (err) {
    console.error("Failed to toggle shopping item:", err);
    throw err;
  }
}

export async function setShoppingItemsChecked(
  date: string,
  itemIds: Set<string>,
  checked: boolean,
  updatedBy: string,
) {
  try {
    await mutateShoppingList(date, updatedBy, (list) =>
      list.map((item) =>
        itemIds.has(item.id) ? { ...item, checked } : item,
      ),
    );
  } catch (err) {
    console.error("Failed to set shopping items checked:", err);
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
    await mutateShoppingList(date, updatedBy, (list) =>
      list.map((item) => {
        if (item.quantity != null) return item; // preserve existing quantities
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
    await mutateShoppingList(date, updatedBy, (list) =>
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
    await mutateShoppingList(date, updatedBy, (list) =>
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

export async function updateShoppingItemText(
  date: string,
  itemId: string,
  text: string,
  updatedBy: string,
) {
  try {
    await mutateShoppingList(date, updatedBy, (list) =>
      list.map((item) => (item.id === itemId ? { ...item, text } : item)),
    );
  } catch (err) {
    console.error("Failed to update shopping item text:", err);
    throw err;
  }
}

export async function removeShoppingItem(
  date: string,
  itemId: string,
  updatedBy: string,
) {
  try {
    await mutateShoppingList(date, updatedBy, (list) =>
      list.filter((item) => item.id !== itemId),
    );
  } catch (err) {
    console.error("Failed to remove shopping item:", err);
    throw err;
  }
}
