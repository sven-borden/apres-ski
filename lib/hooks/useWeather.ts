"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { refreshWeather } from "@/lib/actions/weather";
import type { WeatherData } from "@/lib/types";

function normalizeWeather(raw: Record<string, unknown>): WeatherData {
  return {
    temperature: typeof raw.temperature === "number" ? raw.temperature : 0,
    temperatureMin: typeof raw.temperatureMin === "number" ? raw.temperatureMin : 0,
    temperatureMax: typeof raw.temperatureMax === "number" ? raw.temperatureMax : 0,
    weatherCode: typeof raw.weatherCode === "number" ? raw.weatherCode : 0,
    snowDepth: typeof raw.snowDepth === "number" ? raw.snowDepth : 0,
    freezingLevel: typeof raw.freezingLevel === "number" ? raw.freezingLevel : 0,
    fetchedAt: raw.fetchedAt as WeatherData["fetchedAt"],
  };
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refreshing = useRef(false);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      doc(db, "weather", "la-tzoumaz"),
      (snap) => {
        const weather = snap.exists() ? normalizeWeather(snap.data()) : null;
        setData(weather);
        setLoading(false);

        const fetchedAt = weather?.fetchedAt?.toMillis?.() ?? 0;
        const isStale = Date.now() - fetchedAt > ONE_HOUR_MS;

        if (isStale && !refreshing.current) {
          refreshing.current = true;
          refreshWeather()
            .catch((err) => setError(err))
            .finally(() => {
              refreshing.current = false;
            });
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  return { data, loading, error };
}
