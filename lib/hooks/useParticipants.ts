"use client";

import { usePolledResource } from "./usePolledResource";
import type { Participant } from "@/lib/types";

const EMPTY: Participant[] = [];

export function useParticipants() {
  const { data, loading, error } = usePolledResource<Participant[]>(
    "/api/db/participants",
    EMPTY,
  );
  return { participants: data, loading, error };
}
