"use client";

import { usePolled, type Polled } from "@/lib/hooks/use-polled";
import type {
  AttendanceRecord,
  BasecampRecord,
  MealRecord,
  ParticipantRecord,
  TripRecord,
  WeatherRecord,
} from "@/lib/pb/types";

export const useTrip = (): Polled<TripRecord | null> => usePolled("/api/db/trip");
export const useBasecamp = (): Polled<BasecampRecord | null> => usePolled("/api/db/basecamp");
export const useParticipants = (): Polled<ParticipantRecord[]> => usePolled("/api/db/participants");
export const useAttendance = (): Polled<AttendanceRecord[]> => usePolled("/api/db/attendance");
export const useMeals = (): Polled<MealRecord[]> => usePolled("/api/db/meals");
/** Weather changes slowly — poll on a much slower cadence (PROJECT.md §7.1). */
export const useWeather = (): Polled<WeatherRecord | null> =>
  usePolled("/api/db/weather", 5 * 60 * 1000);
