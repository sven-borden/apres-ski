"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDateShort, isToday } from "@/lib/utils/dates";

export function DateScroller({
  dates,
  selectedDate,
  onSelectDate,
}: {
  dates: string[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDate]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {dates.map((date) => {
        const selected = date === selectedDate;
        const today = isToday(date);

        return (
          <button
            key={date}
            ref={selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelectDate(date)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-alpine text-white"
                : today
                  ? "border border-alpine text-alpine bg-glass backdrop-blur-sm"
                  : "bg-glass backdrop-blur-sm border border-glass-border text-midnight",
            )}
          >
            {formatDateShort(date)}
          </button>
        );
      })}
    </div>
  );
}
