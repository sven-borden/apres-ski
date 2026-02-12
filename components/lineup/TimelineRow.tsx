"use client";

import { Avatar } from "@/components/ui/Avatar";
import { TimelineCell } from "@/components/lineup/TimelineCell";
import type { Participant } from "@/lib/types";

export function TimelineRow({
  participant,
  dates,
  attendanceSet,
  todayStr,
  onToggle,
  onEdit,
}: {
  participant: Participant;
  dates: string[];
  attendanceSet: Set<string>;
  todayStr: string;
  onToggle: (participantId: string, date: string, currentlyPresent: boolean) => void;
  onEdit?: (participant: Participant) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 shrink-0 sticky left-0 bg-white/85 z-10 flex items-center gap-2 pr-2">
        <Avatar initials={participant.avatar} color={participant.color} size="sm" />
        <span className="text-sm font-medium text-midnight truncate flex-1">
          {participant.name}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(participant)}
            className="text-mist hover:text-alpine transition-colors p-0.5 shrink-0"
            aria-label={`Edit ${participant.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
        )}
      </div>
      {dates.map((date) => {
        const present = attendanceSet.has(date);
        return (
          <TimelineCell
            key={date}
            isPresent={present}
            participantColor={participant.color}
            participantName={participant.name}
            date={date}
            isToday={date === todayStr}
            onToggle={() => onToggle(participant.id, date, present)}
          />
        );
      })}
    </div>
  );
}
