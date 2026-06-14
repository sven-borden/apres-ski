import { NextResponse } from "next/server";
import { getPb } from "@/lib/pb/server";
import { normalizeParticipant } from "@/lib/pb/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const pb = getPb();
  try {
    const recs = await pb.collection("participants").getFullList({
      filter: "tripId = 'current' || tripId = ''",
      sort: "joinedAt",
    });
    return NextResponse.json(recs.map(normalizeParticipant));
  } catch (err) {
    console.error("GET /api/db/participants failed:", err);
    return NextResponse.json(
      { error: "Failed to load participants" },
      { status: 500 },
    );
  }
}
