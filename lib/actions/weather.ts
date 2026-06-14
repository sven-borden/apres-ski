import "server-only";
import { getPb, WEATHER_DOC_ID } from "@/lib/pb/server";
import { normalizeWeather } from "@/lib/pb/normalize";
import type { WeatherData } from "@/lib/types";

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?" +
  "latitude=46.08&longitude=7.23" +
  "&current=temperature_2m,weather_code,snow_depth" +
  "&daily=temperature_2m_max,temperature_2m_min" +
  "&hourly=freezing_level_height" +
  "&forecast_days=1" +
  "&timezone=Europe/Zurich";

// Fetches La Tzoumaz weather from Open-Meteo and upserts the single
// `la-tzoumaz` weather record. fetchedAt is a PocketBase autodate, set
// automatically on write. Runs server-side only (writes to internal PB).
export async function refreshWeather(): Promise<WeatherData> {
  const res = await fetch(OPEN_METEO_URL);
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);
  const json = await res.json();

  const freezingLevels = json.hourly.freezing_level_height as number[];
  const freezingLevel = Math.round(
    freezingLevels.reduce((a, b) => a + b, 0) / freezingLevels.length,
  );

  const data = {
    temperature: json.current.temperature_2m as number,
    temperatureMin: json.daily.temperature_2m_min[0] as number,
    temperatureMax: json.daily.temperature_2m_max[0] as number,
    weatherCode: json.current.weather_code as number,
    snowDepth: Math.round((json.current.snow_depth as number) * 100),
    freezingLevel,
  };

  const pb = getPb();
  let rec;
  try {
    rec = await pb.collection("weather").update(WEATHER_DOC_ID, data);
  } catch (err) {
    if ((err as { status?: number }).status === 404) {
      rec = await pb
        .collection("weather")
        .create({ id: WEATHER_DOC_ID, ...data });
    } else {
      throw err;
    }
  }
  return normalizeWeather(rec);
}
