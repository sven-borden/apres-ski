import { NextResponse } from "next/server";
import { getPb } from "@/lib/pb/server";
import { normalizeAttendance } from "@/lib/pb/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const pb = getPb();
  try {
    const recs = await pb.collection("attendance").getFullList({
      filter: "tripId = 'current'",
    });
    return NextResponse.json(recs.map(normalizeAttendance));
  } catch (err) {
    console.error("GET /api/db/attendance failed:", err);
    return NextResponse.json(
      { error: "Failed to load attendance" },
      { status: 500 },
    );
  }
}
