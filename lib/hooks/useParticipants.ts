"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Participant } from "@/lib/types";

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(collection(db, "participants"), where("tripId", "in", ["current", ""]));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setParticipants(
          snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Participant),
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

  return { participants, loading, error };
}
