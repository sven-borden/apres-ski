"use client";

import { cn } from "@/lib/utils/cn";

export function TimelineCell({
  isPresent,
  participantColor,
  isToday,
  onToggle,
}: {
  isPresent: boolean;
  participantColor: string;
  isToday: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-12 h-12 rounded-lg border-2 transition-colors shrink-0",
        !isPresent && isToday && "bg-alpine/5 border-alpine/20",
        !isPresent && !isToday && "bg-powder border-mist/20",
      )}
      style={isPresent ? { backgroundColor: participantColor, borderColor: participantColor } : undefined}
    />
  );
}
