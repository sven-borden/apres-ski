"use client";

import { useMemo } from "react";
import { getCountdownData } from "@/lib/utils/countdown";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LiteHero({
  tripName,
  startDate,
  endDate,
}: {
  tripName: string | null;
  startDate: string | null;
  endDate: string | null;
}) {
  const { t } = useLocale();

  const data = useMemo(
    () =>
      startDate && endDate ? getCountdownData(startDate, endDate) : null,
    [startDate, endDate],
  );

  const countdownText = useMemo(() => {
    if (!data) return null;
    if (data.state === "before") {
      return t.countdown.in_days(data.days);
    }
    if (data.state === "during") {
      return t.countdown.day_of(data.dayNum, data.totalDays);
    }
    return t.countdown.hope_fun;
  }, [data, t]);

  return (
    <div className="flex items-center justify-between py-2">
      <h1 className="text-2xl font-bold text-white drop-shadow-sm">
        {tripName ?? "Apres-Ski"}
      </h1>

      {countdownText && (
        <span className="bg-spritz text-white text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
          {countdownText}
        </span>
      )}
    </div>
  );
}
