import { NextResponse } from "next/server";
import { getPb } from "@/lib/pb/server";
import { normalizeMeal } from "@/lib/pb/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const pb = getPb();
  try {
    const recs = await pb.collection("meals").getFullList({
      filter: "tripId = 'current'",
      sort: "date",
    });
    return NextResponse.json(recs.map(normalizeMeal));
  } catch (err) {
    console.error("GET /api/db/meals failed:", err);
    return NextResponse.json(
      { error: "Failed to load meals" },
      { status: 500 },
    );
  }
}
