"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { getDateRange, formatDateShort, isToday } from "@/lib/utils/dates";
import { TimelineRow } from "@/components/rostrum/TimelineRow";
import { toggleAttendance } from "@/lib/actions/attendance";
import { sortParticipants } from "@/lib/utils/colors";
import type { Trip, Participant, Attendance } from "@/lib/types";

export function TimelineMatrix({
  trip,
  participants,
  attendance,
}: {
  trip: Trip;
  participants: Participant[];
  attendance: Attendance[];
}) {
  const { dates, todayStr, attendanceMap } = useMemo(() => {
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

    return { dates, todayStr, attendanceMap };
  }, [trip.startDate, trip.endDate, attendance]);

  function handleToggle(participantId: string, date: string, currentlyPresent: boolean) {
    const p = participants.find((p) => p.id === participantId);
    if (!p) return;
    toggleAttendance({ id: p.id, name: p.name, color: p.color }, date, currentlyPresent);
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <div className="inline-flex flex-col min-w-max gap-2">
        {/* Date header row */}
        <div className="flex items-end gap-2">
          <div className="w-32 shrink-0" />
          {dates.map((date) => {
            const label = formatDateShort(date);
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

        {/* Participant rows */}
        {sortParticipants(participants).map((p) => (
          <TimelineRow
            key={p.id}
            participant={p}
            dates={dates}
            attendanceSet={attendanceMap.get(p.id) ?? new Set()}
            todayStr={todayStr}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
