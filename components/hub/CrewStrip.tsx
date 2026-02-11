"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, sortParticipants } from "@/lib/utils/colors";
import { formatDateShort } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { Participant } from "@/lib/types";

export function CrewStrip({
  participants,
  dates,
  attendanceByDate,
  capacity,
  today,
}: {
  participants: Participant[];
  dates: string[];
  attendanceByDate: Map<string, Set<string>>;
  capacity: number | null;
  today: string;
}) {
  const sorted = sortParticipants(participants);
  const maxCount = dates.reduce((max, d) => {
    const count = attendanceByDate.get(d)?.size ?? 0;
    return Math.max(max, count);
  }, capacity ?? 1);

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-midnight">Crew</h3>
            <span className="text-xs text-mist">{participants.length}</span>
          </div>
          <Link
            href="/crew"
            className="text-xs font-medium text-alpine hover:text-alpine/80 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          {sorted.map((p) => (
            <Avatar
              key={p.id}
              initials={getInitials(p.name)}
              color={p.color}
              size="sm"
            />
          ))}
        </div>

        {/* Attendance sparkline */}
        {dates.length > 0 && (
          <div className="flex items-end gap-0.5">
            {dates.map((d, i) => {
              const count = attendanceByDate.get(d)?.size ?? 0;
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const isToday = d === today;
              const isOverCapacity = capacity !== null && count > capacity;
              const isFirst = i === 0;
              const isLast = i === dates.length - 1;
              const showLabel = isFirst || isLast || isToday;

              return (
                <div key={d} className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-full flex justify-center" style={{ height: 32 }}>
                    <div
                      className={cn(
                        "w-3 rounded-t-sm self-end transition-all",
                        isOverCapacity
                          ? "bg-red-400"
                          : isToday
                            ? "bg-alpine"
                            : "bg-mist/30",
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] mt-0.5 truncate",
                      showLabel ? "text-mist" : "text-transparent",
                      isToday && "font-bold text-alpine",
                    )}
                  >
                    {formatDateShort(d).split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
