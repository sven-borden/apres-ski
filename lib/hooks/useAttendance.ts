"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Attendance } from "@/lib/types";

function normalizeAttendance(raw: Record<string, unknown>, id: string): Attendance {
  return {
    id,
    participantId: (raw.participantId as string) ?? "",
    participantName: (raw.participantName as string) ?? "",
    participantColor: (raw.participantColor as string) ?? "",
    date: (raw.date as string) ?? "",
    present: typeof raw.present === "boolean" ? raw.present : false,
    tripId: (raw.tripId as string) ?? "",
  };
}

export function useAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(collection(db, "attendance"), where("tripId", "==", "current"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAttendance(
          snap.docs.map((d) => normalizeAttendance(d.data(), d.id)),
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

  return { attendance, loading, error };
}
