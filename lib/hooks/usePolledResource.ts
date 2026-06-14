"use client";

import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 4000;

// Polls a read route handler on an interval and exposes the familiar
// { data, loading, error } shape. Skips fetches while the tab is hidden and
// refetches immediately when it becomes visible again. This is the interim
// transport; #127 swaps the poll for a server-side SSE proxy of PocketBase
// realtime without changing this hook's consumers.
export function usePolledResource<T>(
  url: string,
  initial: T,
  intervalMs: number = DEFAULT_INTERVAL_MS,
): { data: T; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function tick() {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        return;
      }
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = (await res.json()) as T;
        if (!active) return;
        setData(json);
        setError(null);
      } catch (err) {
        if (active) setError(err as Error);
      } finally {
        if (active) setLoading(false);
      }
    }

    tick();
    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [url, intervalMs]);

  return { data, loading, error };
}
