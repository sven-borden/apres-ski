"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Basecamp } from "@/lib/types";

function normalizeBasecamp(raw: Record<string, unknown>): Basecamp {
  const coords = raw.coordinates as Record<string, unknown> | undefined;
  const wifi = raw.wifi as Record<string, unknown> | undefined;
  return {
    name: (raw.name as string) ?? "",
    address: (raw.address as string) ?? "",
    coordinates:
      coords && typeof coords.lat === "number" && typeof coords.lng === "number"
        ? { lat: coords.lat, lng: coords.lng }
        : { lat: 0, lng: 0 },
    mapsUrl: (raw.mapsUrl as string) ?? "",
    wifi:
      wifi && typeof wifi.network === "string" && typeof wifi.password === "string"
        ? { network: wifi.network, password: wifi.password }
        : { network: "", password: "" },
    checkIn: (raw.checkIn as string) ?? "",
    checkOut: (raw.checkOut as string) ?? "",
    capacity: typeof raw.capacity === "number" ? raw.capacity : 0,
    accessCodes: Array.isArray(raw.accessCodes) ? raw.accessCodes : [],
    emergencyContacts: Array.isArray(raw.emergencyContacts) ? raw.emergencyContacts : [],
    notes: (raw.notes as string) ?? "",
    updatedAt: raw.updatedAt as Basecamp["updatedAt"],
    updatedBy: (raw.updatedBy as string) ?? "",
  };
}

export function useBasecamp() {
  const [basecamp, setBasecamp] = useState<Basecamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      doc(db, "basecamp", "current"),
      (snap) => {
        setBasecamp(snap.exists() ? normalizeBasecamp(snap.data()) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, []);

  return { basecamp, loading, error };
}
