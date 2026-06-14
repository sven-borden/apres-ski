"use client";

import { useMemo } from "react";
import { getCountdownData, getDailyQuote } from "@/lib/utils/countdown";
import { useWeather } from "@/lib/hooks/useWeather";
import { getWeatherCondition } from "@/lib/utils/weather";
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
  const { data: weather } = useWeather();

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

  const weatherCondition = useMemo(
    () => (weather ? getWeatherCondition(weather.weatherCode, t) : null),
    [weather, t],
  );

  return (
    <div className="py-2 space-y-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-sm">
          {tripName ?? "Apres-Ski"}
        </h1>

        {countdownText && (
          <span className="bg-spritz text-white text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
            {countdownText}
          </span>
        )}
      </div>

      {data?.state === "during" && (
        <p className="text-white/70 text-sm italic">
          {"\u00AB"} {getDailyQuote(data.dayNum)} {"\u00BB"}
        </p>
      )}

      {weather && weatherCondition && (
        <p className="text-white/80 text-sm font-medium">
          {weatherCondition.emoji} {Math.round(weather.temperature)}°C
          <span className="mx-1.5">·</span>
          <span className="text-alpine font-semibold drop-shadow-sm">
            {Math.round(weather.snowDepth)} cm
          </span>
        </p>
      )}
    </div>
  );
}
