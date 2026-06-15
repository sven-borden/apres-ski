import { guard } from "@/lib/server/guard";
import { aiMerge } from "@/lib/ai/anthropic";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;

  let body: { items?: { id: string; text: string }[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  if (items.length === 0) return Response.json({ groups: [] });

  try {
    const groups = await aiMerge(items, body.locale === "en" ? "en" : "fr");
    return Response.json({ groups });
  } catch (err) {
    console.error("[ai/merge]", err);
    return Response.json({ error: "Le tri IA est indisponible." }, { status: 502 });
  }
}
