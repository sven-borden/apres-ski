"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";
import { sortParticipants, getInitials } from "@/lib/utils/colors";
import { toggleAttendance } from "@/lib/actions/attendance";
import type { Participant } from "@/lib/types";

export function AttendanceToggleList({
  date,
  allParticipants,
  presentIds,
  capacity,
}: {
  date: string;
  allParticipants: Participant[];
  presentIds: Set<string>;
  capacity: number | null;
}) {
  const sorted = sortParticipants(allParticipants);
  const presentCount = presentIds.size;
  const overCapacity = capacity !== null && presentCount > capacity;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-midnight">Sleeping over</h3>
        {capacity !== null && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              overCapacity
                ? "bg-red-100 text-red-600"
                : "bg-alpine/10 text-alpine",
            )}
          >
            {presentCount}/{capacity}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p) => {
          const isPresent = presentIds.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                toggleAttendance(
                  { id: p.id, name: p.name, color: p.color },
                  date,
                  isPresent,
                )
              }
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors",
                isPresent
                  ? "border-alpine bg-alpine/10 text-alpine"
                  : "border-mist/30 bg-powder text-mist",
              )}
            >
              <Avatar
                initials={getInitials(p.name)}
                color={isPresent ? p.color : "#94A3B8"}
                size="sm"
              />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
