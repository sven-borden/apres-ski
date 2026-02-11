"use client";

import { Card } from "@/components/ui/Card";
import { useWeather } from "@/lib/hooks/useWeather";
import { getWeatherCondition, getSnowVibe } from "@/lib/utils/weather";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function WeatherWidget() {
  const { data, loading, error } = useWeather();
  const { t } = useLocale();

  if (loading) {
    return (
      <Card className="animate-pulse min-w-[220px]">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-mist/20" />
          <div className="h-8 w-16 rounded bg-mist/20" />
          <div className="h-3 w-32 rounded bg-mist/20" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="min-w-[220px]">
        <p className="text-sm text-mist">{t.hub.weather_unavailable}</p>
      </Card>
    );
  }

  const condition = getWeatherCondition(data.weatherCode, t);
  const snowVibe = getSnowVibe(data.snowDepth, t);
  const hasSnow = data.snowDepth > 10;

  return (
    <Card
      className={cn(
        "min-w-[220px]",
        hasSnow && "ring-2 ring-alpine/50 animate-glow",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg">
            {condition.emoji} {condition.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-alpine">{data.snowDepth}cm</p>
            <p className="text-[11px] text-mist">{t.hub.snow_depth}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-midnight">
              {Math.round(data.temperature)}&deg;
            </p>
            <p className="text-[11px] text-mist">
              {Math.round(data.temperatureMin)}&deg; / {Math.round(data.temperatureMax)}&deg;
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-midnight">
              {data.freezingLevel}m
            </p>
            <p className="text-[11px] text-mist">{t.hub.freezing_level}</p>
          </div>
        </div>

        <p className="text-xs text-mist text-center">{snowVibe}</p>
      </div>
    </Card>
  );
}
