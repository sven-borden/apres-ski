import type { Translations } from "@/lib/i18n/locales";

type ConditionKey = keyof Translations["weather"]["conditions"];

const WMO_CODES: Record<number, { emoji: string; key: ConditionKey }> = {
  0: { emoji: "\u2600\uFE0F", key: "clear_sky" },
  1: { emoji: "\uD83C\uDF24\uFE0F", key: "mostly_clear" },
  2: { emoji: "\u26C5", key: "partly_cloudy" },
  3: { emoji: "\u2601\uFE0F", key: "overcast" },
  45: { emoji: "\uD83C\uDF2B\uFE0F", key: "foggy" },
  48: { emoji: "\uD83C\uDF2B\uFE0F", key: "icy_fog" },
  51: { emoji: "\uD83C\uDF27\uFE0F", key: "light_drizzle" },
  53: { emoji: "\uD83C\uDF27\uFE0F", key: "drizzle" },
  55: { emoji: "\uD83C\uDF27\uFE0F", key: "heavy_drizzle" },
  56: { emoji: "\uD83C\uDF27\uFE0F", key: "freezing_drizzle" },
  57: { emoji: "\uD83C\uDF27\uFE0F", key: "heavy_freezing_drizzle" },
  61: { emoji: "\uD83C\uDF27\uFE0F", key: "light_rain" },
  63: { emoji: "\uD83C\uDF27\uFE0F", key: "rain" },
  65: { emoji: "\uD83C\uDF27\uFE0F", key: "heavy_rain" },
  66: { emoji: "\uD83E\uDDCA", key: "freezing_rain" },
  67: { emoji: "\uD83E\uDDCA", key: "heavy_freezing_rain" },
  71: { emoji: "\uD83C\uDF28\uFE0F", key: "light_snow" },
  73: { emoji: "\u2744\uFE0F", key: "snow" },
  75: { emoji: "\u2744\uFE0F", key: "heavy_snow" },
  77: { emoji: "\uD83C\uDF28\uFE0F", key: "snow_grains" },
  80: { emoji: "\uD83C\uDF26\uFE0F", key: "light_showers" },
  81: { emoji: "\uD83C\uDF26\uFE0F", key: "showers" },
  82: { emoji: "\uD83C\uDF26\uFE0F", key: "heavy_showers" },
  85: { emoji: "\uD83C\uDF28\uFE0F", key: "light_snow_showers" },
  86: { emoji: "\u2744\uFE0F", key: "heavy_snow_showers" },
  95: { emoji: "\u26C8\uFE0F", key: "thunderstorm" },
  96: { emoji: "\u26C8\uFE0F", key: "thunderstorm_hail" },
  99: { emoji: "\u26C8\uFE0F", key: "thunderstorm_heavy_hail" },
};

export function getWeatherCondition(
  code: number,
  t: Translations,
): { emoji: string; label: string } {
  const entry = WMO_CODES[code];
  if (!entry) return { emoji: "\u2753", label: t.weather.conditions.unknown };
  return { emoji: entry.emoji, label: t.weather.conditions[entry.key] };
}

type SnowVibeKey = keyof Translations["weather"]["snow_vibe"];

export function getSnowVibe(
  snowDepthCm: number,
  t: Translations,
): string {
  let key: SnowVibeKey;
  if (snowDepthCm >= 100) key = "powder_paradise";
  else if (snowDepthCm >= 50) key = "deep_and_dreamy";
  else if (snowDepthCm >= 30) key = "solid_base";
  else if (snowDepthCm >= 10) key = "decent_cover";
  else if (snowDepthCm > 0) key = "thin_cover";
  else key = "no_snow";
  return t.weather.snow_vibe[key];
}
