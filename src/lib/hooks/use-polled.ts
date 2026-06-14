"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Polled<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Poll a JSON endpoint on an interval. Pauses while the tab is hidden and
 * refetches immediately when it becomes visible (PROJECT.md §7.1).
 */
export function usePolled<T>(url: string, intervalMs = 4000): Polled<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
      const json = (await res.json()) as T;
      if (mounted.current) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(err as Error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    // Initial fetch — setState happens after an await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, intervalMs);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted.current = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, intervalMs]);

  return { data, error, loading, refresh };
}
