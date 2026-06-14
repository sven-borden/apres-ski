import { NextResponse } from "next/server";
import { getPb, BASECAMP_DOC_ID } from "@/lib/pb/server";
import { normalizeBasecamp } from "@/lib/pb/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const pb = getPb();
  try {
    const rec = await pb.collection("basecamp").getOne(BASECAMP_DOC_ID);
    return NextResponse.json(normalizeBasecamp(rec));
  } catch (err) {
    if ((err as { status?: number }).status === 404) {
      return NextResponse.json(null);
    }
    console.error("GET /api/db/basecamp failed:", err);
    return NextResponse.json(
      { error: "Failed to load basecamp" },
      { status: 500 },
    );
  }
}
