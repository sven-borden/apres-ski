"use client";

import { usePolledResource } from "./usePolledResource";
import type { WeatherData } from "@/lib/types";

// Weather changes hourly and the /api/db/weather route refreshes from
// Open-Meteo server-side when its data is stale (>1h), so a slow poll is enough.
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useWeather() {
  const { data, loading, error } = usePolledResource<WeatherData | null>(
    "/api/db/weather",
    null,
    FIVE_MINUTES_MS,
  );
  return { data, loading, error };
}
