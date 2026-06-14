import { NextResponse } from "next/server";
import { getPb, WEATHER_DOC_ID } from "@/lib/pb/server";
import { normalizeWeather } from "@/lib/pb/normalize";
import { refreshWeather } from "@/lib/actions/weather";

export const dynamic = "force-dynamic";

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET() {
  const pb = getPb();
  try {
    let weather;
    try {
      const rec = await pb.collection("weather").getOne(WEATHER_DOC_ID);
      weather = normalizeWeather(rec);
    } catch (err) {
      if ((err as { status?: number }).status !== 404) throw err;
      weather = null;
    }

    const fetchedAt = weather ? Date.parse(weather.fetchedAt) : 0;
    const isStale = Number.isNaN(fetchedAt) || Date.now() - fetchedAt > ONE_HOUR_MS;

    if (!weather || isStale) {
      try {
        weather = await refreshWeather();
      } catch (refreshErr) {
        // Serve stale data if the refresh fails; only error if we have nothing.
        console.error("Weather refresh failed:", refreshErr);
        if (!weather) throw refreshErr;
      }
    }

    return NextResponse.json(weather);
  } catch (err) {
    console.error("GET /api/db/weather failed:", err);
    return NextResponse.json(
      { error: "Failed to load weather" },
      { status: 500 },
    );
  }
}
