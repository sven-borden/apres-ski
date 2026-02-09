"use client";

import { Avatar } from "@/components/ui/Avatar";
import { TimelineCell } from "@/components/rostrum/TimelineCell";
import type { Participant } from "@/lib/types";

export function TimelineRow({
  participant,
  dates,
  attendanceSet,
  todayStr,
  onToggle,
}: {
  participant: Participant;
  dates: string[];
  attendanceSet: Set<string>;
  todayStr: string;
  onToggle: (participantId: string, date: string, currentlyPresent: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 shrink-0 sticky left-0 bg-glacier z-10 flex items-center gap-2 pr-2">
        <Avatar initials={participant.avatar} color={participant.color} size="sm" />
        <span className="text-sm font-medium text-midnight truncate">
          {participant.name}
        </span>
      </div>
      {dates.map((date) => {
        const present = attendanceSet.has(date);
        return (
          <TimelineCell
            key={date}
            isPresent={present}
            participantColor={participant.color}
            isToday={date === todayStr}
            onToggle={() => onToggle(participant.id, date, present)}
          />
        );
      })}
    </div>
  );
}
