import { pbList } from "@/lib/pb/server";
import type { MealRecord } from "@/lib/pb/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await pbList<MealRecord>("meals", { sort: "date" }));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
