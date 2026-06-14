"use client";

import { usePolledResource } from "./usePolledResource";
import type { Attendance } from "@/lib/types";

const EMPTY: Attendance[] = [];

export function useAttendance() {
  const { data, loading, error } = usePolledResource<Attendance[]>(
    "/api/db/attendance",
    EMPTY,
  );
  return { attendance: data, loading, error };
}
