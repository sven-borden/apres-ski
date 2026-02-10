"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { refreshWeather } from "@/lib/actions/weather";
import type { WeatherData } from "@/lib/types";

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
        const weather = snap.exists() ? (snap.data() as WeatherData) : null;
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
