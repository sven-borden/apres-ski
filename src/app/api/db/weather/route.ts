import { getWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getWeather());
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
