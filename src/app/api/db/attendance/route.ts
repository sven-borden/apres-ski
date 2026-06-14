import { pbList } from "@/lib/pb/server";
import type { AttendanceRecord } from "@/lib/pb/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only present records exist (presence-by-existence, PROJECT.md §2.3).
    return Response.json(
      await pbList<AttendanceRecord>("attendance", { filter: "present=true", sort: "date" }),
    );
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
