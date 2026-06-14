"use client";

import { usePolledResource } from "./usePolledResource";
import type { Trip } from "@/lib/types";

export function useTrip() {
  const { data, loading, error } = usePolledResource<Trip | null>(
    "/api/db/trip",
    null,
  );
  return { trip: data, loading, error };
}
