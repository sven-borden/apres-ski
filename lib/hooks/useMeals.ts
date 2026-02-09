"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Meal } from "@/lib/types";

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      collection(db, "meals"),
      (snap) => {
        setMeals(
          snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Meal),
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
