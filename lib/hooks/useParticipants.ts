"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Participant } from "@/lib/types";

function normalizeParticipant(raw: Record<string, unknown>, id: string): Participant {
  return {
    id,
    name: (raw.name as string) ?? "",
    color: (raw.color as string) ?? "",
    avatar: (raw.avatar as string) ?? "",
    joinedAt: raw.joinedAt as Participant["joinedAt"],
    tripId: (raw.tripId as string) ?? "",
  };
}

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      collection(db, "participants"),
      (snap) => {
        setParticipants(
          snap.docs.map((d) => normalizeParticipant(d.data(), d.id)),
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
