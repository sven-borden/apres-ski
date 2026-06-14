import { pbFirst } from "@/lib/pb/server";
import type { BasecampRecord } from "@/lib/pb/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await pbFirst<BasecampRecord>("basecamp", { sort: "-created" }));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
