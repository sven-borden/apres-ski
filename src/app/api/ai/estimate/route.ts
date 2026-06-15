import { guard } from "@/lib/server/guard";
import { aiEstimate } from "@/lib/ai/anthropic";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;

  let body: {
    category?: "dinner" | "general";
    headcount?: number;
    items?: { id: string; text: string }[];
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const category = body.category === "general" ? "general" : "dinner";
  const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
  if (items.length === 0) return Response.json({ estimates: [] });

  try {
    const estimates = await aiEstimate(category, Number(body.headcount) || 0, items, body.description ?? "");
    return Response.json({ estimates });
  } catch (err) {
    console.error("[ai/estimate]", err);
    return Response.json({ error: "L’estimation IA est indisponible." }, { status: 502 });
  }
}
