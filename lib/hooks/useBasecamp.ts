"use client";

import { usePolledResource } from "./usePolledResource";
import type { Basecamp } from "@/lib/types";

export function useBasecamp() {
  const { data, loading, error } = usePolledResource<Basecamp | null>(
    "/api/db/basecamp",
    null,
  );
  return { basecamp: data, loading, error };
}
