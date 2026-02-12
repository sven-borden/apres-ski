"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Attendance } from "@/lib/types";

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
          snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Attendance),
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
