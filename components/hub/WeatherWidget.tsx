"use client";

import { Card } from "@/components/ui/Card";
import { useWeather } from "@/lib/hooks/useWeather";
import { getWeatherCondition, getSnowVibe } from "@/lib/utils/weather";
import { cn } from "@/lib/utils/cn";

export function WeatherWidget() {
  const { data, loading, error } = useWeather();

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
        <p className="text-sm text-mist">Weather unavailable</p>
      </Card>
    );
  }

  const condition = getWeatherCondition(data.weatherCode);
  const snowVibe = getSnowVibe(data.snowDepth);
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
          <span className="text-xs text-mist">La Tzoumaz</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-alpine">{data.snowDepth}cm</p>
            <p className="text-[11px] text-mist">Snow depth</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-midnight">
              {Math.round(data.temperature)}°
            </p>
            <p className="text-[11px] text-mist">
              {Math.round(data.temperatureMin)}° / {Math.round(data.temperatureMax)}°
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-midnight">
              {data.freezingLevel}m
            </p>
            <p className="text-[11px] text-mist">0° level</p>
          </div>
        </div>

        <p className="text-xs text-mist text-center">{snowVibe}</p>
      </div>
    </Card>
  );
}
