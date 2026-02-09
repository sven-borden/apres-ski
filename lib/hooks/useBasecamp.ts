"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Basecamp } from "@/lib/types";

export function useBasecamp() {
  const [basecamp, setBasecamp] = useState<Basecamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(
      doc(db, "basecamp", "current"),
      (snap) => {
        setBasecamp(snap.exists() ? (snap.data() as Basecamp) : null);
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
