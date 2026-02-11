"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Translations } from "@/lib/i18n/locales";

const DAY_KEYS: (keyof Translations["days"])[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDayLabel(dateStr: string, t: Translations): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return t.days[DAY_KEYS[date.getDay()]];
}

function getDayNumber(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return String(date.getDate());
}

export function CrewStrip({
  dates,
  attendanceByDate,
  capacity,
  today,
}: {
  participants: { id: string }[];
  dates: string[];
  attendanceByDate: Map<string, Set<string>>;
  capacity: number | null;
  today: string;
}) {
  const { t } = useLocale();

  const maxCount = dates.reduce((max, d) => {
    const count = attendanceByDate.get(d)?.size ?? 0;
    return Math.max(max, count);
  }, capacity ?? 1);

  const scaleMax = capacity ? Math.max(maxCount, capacity) : maxCount;

  return (
    <Card>
      <div className="space-y-3">
        {dates.length > 0 && (
          <div>
            {/* Count labels */}
            <div className="flex gap-1">
              {dates.map((d) => {
                const count = attendanceByDate.get(d)?.size ?? 0;
                const isToday = d === today;
                const isOverCapacity =
                  capacity !== null && count > capacity;
                const isAtCapacity =
                  capacity !== null && count === capacity;
                return (
                  <div key={d} className="flex-1 min-w-0 text-center">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isOverCapacity
                          ? "text-red-500"
                          : isAtCapacity
                            ? "text-pine"
                            : isToday
                              ? "text-alpine"
                              : "text-mist",
                      )}
                    >
                      {count > 0 ? count : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bars + capacity line */}
            <div
              className="relative flex items-end gap-1 mt-1"
              style={{ height: 80 }}
            >
              {capacity && scaleMax > 0 && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-spritz/50 pointer-events-none z-10"
                  style={{
                    bottom: `${(capacity / scaleMax) * 100}%`,
                  }}
                >
                  <span className="absolute -top-3.5 right-0 text-[10px] font-medium text-spritz">
                    {capacity} {t.hub.max}
                  </span>
                </div>
              )}

              {dates.map((d) => {
                const count = attendanceByDate.get(d)?.size ?? 0;
                const heightPct =
                  scaleMax > 0 ? (count / scaleMax) * 100 : 0;
                const isToday = d === today;
                const isOverCapacity =
                  capacity !== null && count > capacity;
                const isAtCapacity =
                  capacity !== null && count === capacity;
                return (
                  <div
                    key={d}
                    className="flex-1 min-w-0 flex justify-center h-full"
                  >
                    <div
                      className={cn(
                        "w-full max-w-[28px] rounded-t-md self-end transition-all",
                        isOverCapacity
                          ? "bg-red-400"
                          : isAtCapacity
                            ? "bg-pine"
                            : isToday
                              ? "bg-alpine"
                              : "bg-alpine/20",
                      )}
                      style={{
                        height: `${Math.max(heightPct, count > 0 ? 6 : 0)}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Day labels */}
            <div className="flex gap-1 mt-1.5">
              {dates.map((d) => {
                const isToday = d === today;
                return (
                  <div
                    key={d}
                    className="flex-1 min-w-0 flex flex-col items-center leading-none"
                  >
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        isToday ? "text-alpine font-bold" : "text-mist",
                      )}
                    >
                      {getDayLabel(d, t)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px]",
                        isToday
                          ? "text-alpine font-bold"
                          : "text-midnight/50",
                      )}
                    >
                      {getDayNumber(d)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
