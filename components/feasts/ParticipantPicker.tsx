"use client";

import { Avatar } from "@/components/ui/Avatar";
import { getInitials, sortParticipants } from "@/lib/utils/colors";
import { cn } from "@/lib/utils/cn";
import type { Participant } from "@/lib/types";

export function ParticipantPicker({
  participants,
  selectedIds,
  onToggle,
}: {
  participants: Participant[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const sorted = sortParticipants(participants);

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((p) => {
        const selected = selectedIds.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border",
              selected
                ? "border-alpine bg-alpine/10 text-alpine"
                : "border-mist/30 bg-white/50 text-midnight hover:border-alpine/50",
            )}
          >
            <Avatar
              initials={getInitials(p.name)}
              color={p.color}
              size="sm"
            />
            <span>{p.name}</span>
            {selected && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7l3 3 5-5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
