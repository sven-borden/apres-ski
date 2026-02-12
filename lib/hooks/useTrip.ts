"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

function normalizeTrip(raw: Record<string, unknown>): Trip {
  return {
    name: (raw.name as string) ?? "",
    startDate: (raw.startDate as string) ?? "",
    endDate: (raw.endDate as string) ?? "",
    createdAt: raw.createdAt as Trip["createdAt"],
    updatedAt: raw.updatedAt as Trip["updatedAt"],
    updatedBy: (raw.updatedBy as string) ?? "",
  };
}

export function useTrip() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      doc(db, "trips", "current"),
      (snap) => {
        setTrip(snap.exists() ? normalizeTrip(snap.data()) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  return { trip, loading, error };
}
