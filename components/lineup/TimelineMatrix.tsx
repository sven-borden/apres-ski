"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getDateRange, formatDateShort, isToday } from "@/lib/utils/dates";
import { TimelineRow } from "@/components/lineup/TimelineRow";
import { toggleAttendance } from "@/lib/actions/attendance";
import { sortParticipants } from "@/lib/utils/colors";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Trip, Participant, Attendance } from "@/lib/types";

export function TimelineMatrix({
  trip,
  participants,
  attendance,
  capacity,
  onEditParticipant,
}: {
  trip: Trip;
  participants: Participant[];
  attendance: Attendance[];
  capacity: number | null;
  onEditParticipant?: (participant: Participant) => void;
}) {
  const { user } = useUser();
  const { locale, t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  const { dates, todayStr, attendanceMap, dailyCounts } = useMemo(() => {
    const dates = getDateRange(trip.startDate, trip.endDate);
    const todayStr = dates.find(isToday) ?? "";

    const attendanceMap = new Map<string, Set<string>>();
    for (const a of attendance) {
      let set = attendanceMap.get(a.participantId);
      if (!set) {
        set = new Set();
        attendanceMap.set(a.participantId, set);
      }
      set.add(a.date);
    }

    const dailyCounts = new Map<string, number>();
    for (const date of dates) {
      let count = 0;
      for (const set of attendanceMap.values()) {
        if (set.has(date)) count++;
      }
      dailyCounts.set(date, count);
    }

    return { dates, todayStr, attendanceMap, dailyCounts };
  }, [trip.startDate, trip.endDate, attendance]);

  async function handleToggle(participantId: string, date: string, currentlyPresent: boolean) {
    const p = participants.find((p) => p.id === participantId);
    if (!p) return;
    try {
      await toggleAttendance({ id: p.id, name: p.name, color: p.color }, date, currentlyPresent, user?.id ?? "anonymous");
    } catch {
      setError(t.errors.toggle_failed);
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <div className="flex flex-col min-w-max w-fit mx-auto gap-2">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
        )}

        {/* Date header row */}
        <div className="flex items-end gap-2">
          <div className="w-32 shrink-0" />
          {dates.map((date) => {
            const label = formatDateShort(date, locale);
            const [weekday, day] = label.split(" ");
            const today = date === todayStr;
            return (
              <div
                key={date}
                className={cn(
                  "w-12 shrink-0 text-center text-xs leading-tight",
                  today ? "text-alpine font-semibold" : "text-mist",
                )}
              >
                <div>{weekday}</div>
                <div>{day}</div>
              </div>
            );
          })}
        </div>

        {/* Capacity row */}
        {capacity != null && capacity > 0 && (
          <div className="flex items-center gap-2 border-b border-midnight/10 pb-2 mb-1">
            <div className="w-32 shrink-0 text-xs font-semibold text-mist truncate">
              {t.crew.capacity(capacity)}
            </div>
            {dates.map((date) => {
              const count = dailyCounts.get(date) ?? 0;
              const ratio = count / capacity;
              let colorClass = "text-pine";
              if (ratio > 1.2) colorClass = "text-danger";
              else if (ratio > 1.1) colorClass = "text-caution";
              return (
                <div
                  key={date}
                  className={cn(
                    "w-12 shrink-0 text-center text-sm font-bold",
                    colorClass,
                  )}
                >
                  {count}
                </div>
              );
            })}
          </div>
        )}

        {/* Participant rows */}
        {sortParticipants(participants).map((p) => (
          <TimelineRow
            key={p.id}
            participant={p}
            dates={dates}
            attendanceSet={attendanceMap.get(p.id) ?? new Set()}
            todayStr={todayStr}
            onToggle={handleToggle}
            onEdit={onEditParticipant}
          />
        ))}
      </div>
    </div>
  );
}
