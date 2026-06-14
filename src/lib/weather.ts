import { pbFirst, pbUpsertSingle } from "@/lib/pb/server";
import type { WeatherRecord } from "@/lib/pb/types";

// Fixed resort location (PROJECT.md §2.7): La Tzoumaz / Verbier.
const LAT = 46.0817;
const LNG = 7.2336;
const STALE_MS = 60 * 60 * 1000; // refresh hourly

async function fetchOpenMeteo(): Promise<Omit<WeatherRecord, "id">> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
    `&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&hourly=snow_depth,freezing_level_height&forecast_days=1&timezone=auto`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`open-meteo ${r.status}`);
  const d = await r.json();

  const hourTimes: string[] = d.hourly?.time ?? [];
  const i = Math.max(0, hourTimes.indexOf(d.current?.time));
  const snowM = d.hourly?.snow_depth?.[i] ?? 0; // metres
  const freezing = d.hourly?.freezing_level_height?.[i] ?? 0;

  return {
    temperature: Math.round(d.current?.temperature_2m ?? 0),
    temperatureMax: Math.round(d.daily?.temperature_2m_max?.[0] ?? 0),
    temperatureMin: Math.round(d.daily?.temperature_2m_min?.[0] ?? 0),
    weatherCode: Math.round(d.current?.weather_code ?? 0),
    snowDepth: Math.round(snowM * 100), // cm
    freezingLevel: Math.round(freezing),
  };
}

/** Cached weather; refreshes from Open-Meteo when older than ~1h or missing. */
export async function getWeather(): Promise<WeatherRecord | null> {
  const current = await pbFirst<WeatherRecord>("weather");
  const fetchedAt = current?.fetchedAt ? new Date(current.fetchedAt).getTime() : 0;
  if (current && Date.now() - fetchedAt < STALE_MS) return current;

  try {
    const fresh = await fetchOpenMeteo();
    return await pbUpsertSingle<WeatherRecord>("weather", fresh);
  } catch {
    return current; // upstream failed — serve last-known if any
  }
}
