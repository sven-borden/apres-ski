import { pbFirst } from "@/lib/pb/server";
import type { TripRecord } from "@/lib/pb/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await pbFirst<TripRecord>("trips", { sort: "-created" }));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
