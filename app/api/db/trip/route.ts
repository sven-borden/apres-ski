import { NextResponse } from "next/server";
import { getPb, TRIP_DOC_ID } from "@/lib/pb/server";
import { normalizeTrip } from "@/lib/pb/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const pb = getPb();
  try {
    const rec = await pb.collection("trips").getOne(TRIP_DOC_ID);
    return NextResponse.json(normalizeTrip(rec));
  } catch (err) {
    if ((err as { status?: number }).status === 404) {
      return NextResponse.json(null);
    }
    console.error("GET /api/db/trip failed:", err);
    return NextResponse.json({ error: "Failed to load trip" }, { status: 500 });
  }
}
