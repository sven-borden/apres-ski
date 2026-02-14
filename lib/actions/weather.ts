import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { trackWeatherRefreshed } from "@/lib/analytics";

export async function refreshWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast?" +
    "latitude=46.08&longitude=7.23" +
    "&current=temperature_2m,weather_code,snow_depth" +
    "&daily=temperature_2m_max,temperature_2m_min" +
    "&hourly=freezing_level_height" +
    "&forecast_days=1" +
    "&timezone=Europe/Zurich";

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);

  const json = await res.json();

  const temperature = json.current.temperature_2m as number;
  const weatherCode = json.current.weather_code as number;
  const snowDepthM = json.current.snow_depth as number;
  const temperatureMin = json.daily.temperature_2m_min[0] as number;
  const temperatureMax = json.daily.temperature_2m_max[0] as number;

  const freezingLevels = json.hourly.freezing_level_height as number[];
  const freezingLevel = Math.round(
    freezingLevels.reduce((a: number, b: number) => a + b, 0) /
      freezingLevels.length,
  );

  const db = getDb();
  await setDoc(
    doc(db, "weather", "la-tzoumaz"),
    {
      temperature,
      temperatureMin,
      temperatureMax,
      weatherCode,
      snowDepth: Math.round(snowDepthM * 100),
      freezingLevel,
      fetchedAt: serverTimestamp(),
    },
    { merge: true },
  );
  trackWeatherRefreshed();
}
