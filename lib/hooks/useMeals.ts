"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Meal } from "@/lib/types";

function normalizeMeal(raw: Record<string, unknown>, id: string): Meal {
  return {
    id,
    date: (raw.date as string) ?? "",
    tripId: (raw.tripId as string) ?? "current",
    responsibleIds: (raw.responsibleIds as string[]) ?? [],
    description: (raw.description as string) ?? "",
    shoppingList: Array.isArray(raw.shoppingList) ? raw.shoppingList : [],
    excludeFromShopping: (raw.excludeFromShopping as boolean) ?? false,
    updatedAt: raw.updatedAt as Meal["updatedAt"],
    updatedBy: (raw.updatedBy as string) ?? "",
  };
}

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(collection(db, "meals"), where("tripId", "==", "current"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMeals(
          snap.docs.map((d) => normalizeMeal(d.data(), d.id)),
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  return { meals, loading, error };
}
