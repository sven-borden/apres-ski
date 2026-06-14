import { pbList } from "@/lib/pb/server";
import type { ParticipantRecord } from "@/lib/pb/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await pbList<ParticipantRecord>("participants", { sort: "name" }));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
