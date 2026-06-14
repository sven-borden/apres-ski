"use client";

import { usePolledResource } from "./usePolledResource";
import type { Meal } from "@/lib/types";

const EMPTY: Meal[] = [];

export function useMeals() {
  const { data, loading, error } = usePolledResource<Meal[]>(
    "/api/db/meals",
    EMPTY,
  );
  return { meals: data, loading, error };
}
