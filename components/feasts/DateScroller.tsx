"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDateShort, formatDateLong, isToday } from "@/lib/utils/dates";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function DateScroller({
  dates,
  selectedDate,
  onSelectDate,
  showGeneral = false,
}: {
  dates: string[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  showGeneral?: boolean;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const { locale, t } = useLocale();

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDate]);

  const generalSelected = selectedDate === "general";

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
            aria-current={selected ? "date" : undefined}
            aria-label={formatDateLong(date, locale)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-alpine text-white"
                : today
                  ? "border border-alpine text-alpine bg-glass backdrop-blur-sm"
                  : "bg-glass backdrop-blur-sm border border-glass-border text-midnight",
            )}
          >
            {formatDateShort(date, locale)}
          </button>
        );
      })}
      {showGeneral && (
        <button
          ref={generalSelected ? selectedRef : undefined}
          type="button"
          onClick={() => onSelectDate("general")}
          aria-current={generalSelected ? "date" : undefined}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
            generalSelected
              ? "bg-spritz text-white"
              : "bg-glass backdrop-blur-sm border border-glass-border text-midnight",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {t.feasts.general}
        </button>
      )}
    </div>
  );
}
