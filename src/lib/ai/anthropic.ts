import Anthropic from "@anthropic-ai/sdk";
import { UNITS, type Unit } from "@/lib/feasts";

/**
 * Server-side Claude calls for the two AI conveniences (PROJECT.md §6). The
 * API key lives only on the server (ANTHROPIC_API_KEY). Both functions return
 * sanitized output; the app degrades gracefully if these throw.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
const UNIT_VALUES = UNITS.map((u) => u.value);

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  return (client ??= new Anthropic());
}

function firstText(res: Anthropic.Message): string {
  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

/** Pull the first JSON value out of a model reply (tolerates code fences). */
function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  return JSON.parse(body) as T;
}

const cleanUnit = (u: unknown): Unit | null =>
  typeof u === "string" && (UNIT_VALUES as string[]).includes(u) ? (u as Unit) : null;

const cleanQty = (q: unknown): number | null =>
  typeof q === "number" && isFinite(q) && q >= 0 ? Math.round(q * 100) / 100 : null;

/* ── §6.1 Quantity estimation ─────────────────────────────────────────── */

export type Estimate = { id: string; quantity: number | null; unit: Unit | null };

export async function aiEstimate(
  category: "dinner" | "general",
  headcount: number,
  items: { id: string; text: string }[],
  description = "",
): Promise<Estimate[]> {
  const unitList = UNIT_VALUES.join(", ");
  const system =
    `You estimate grocery quantities for a ski-chalet group. Units MUST be one of: ${unitList}. ` +
    `Output ONLY a JSON array of {"id": string, "quantity": number|null, "unit": string|null}, one per input item, same ids. ` +
    (category === "dinner"
      ? `These are ingredients for a dinner ("${description}") for ${headcount} hungry skiers — estimate generous portions, ~20-30% above standard servings. Items that are clearly apéro/drinks/snacks and not part of the recipe get quantity null.`
      : `These are general trip supplies (apéro, ski lunches, breakfast) where ${headcount} is total person-days. Estimate generously; hot breakfast items very generously.`) +
    ` Round to practical shopping amounts (e.g. 2 packs, not 1.7). When unsure, estimate anyway.`;

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: JSON.stringify({ items }) }],
  });

  const raw = parseJson<unknown>(firstText(res));
  const list = Array.isArray(raw) ? raw : [];
  const byId = new Map(items.map((i) => [i.id, true]));
  return list
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .filter((e) => typeof e.id === "string" && byId.has(e.id))
    .map((e) => {
      const quantity = cleanQty(e.quantity);
      return { id: e.id as string, quantity, unit: quantity != null ? cleanUnit(e.unit) : null };
    });
}

/* ── §6.2 Smart Merge (group + categorise) ────────────────────────────── */

export type MergeGroup = { category: string; items: { canonicalName: string; itemIds: string[] }[] };

export async function aiMerge(
  items: { id: string; text: string }[],
  locale: string,
): Promise<MergeGroup[]> {
  const system =
    `You clean up a multilingual grocery list for a ski trip. Group duplicate or similar items ` +
    `(spelling variants, different languages, different specificity — e.g. "patates", "potatoes", "pommes de terre") ` +
    `under one canonical name, and assign EVERY item (including singletons) to a grocery-store category. ` +
    `Return categories in grocery-aisle order. Use the language "${locale}" for category and canonical names. ` +
    `Suggested categories (translate to ${locale}): Produce, Dairy, Meat & Fish, Bakery, Pantry, Beverages, Frozen, Snacks & Apéro, Condiments & Sauces, Other. ` +
    `Output ONLY JSON: [{"category": string, "items": [{"canonicalName": string, "itemIds": [string]}]}]. Every input id must appear exactly once.`;

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: JSON.stringify({ items }) }],
  });

  const raw = parseJson<unknown>(firstText(res));
  const groups = Array.isArray(raw) ? raw : [];
  const validIds = new Set(items.map((i) => i.id));
  return groups
    .filter((g): g is Record<string, unknown> => !!g && typeof g === "object")
    .map((g) => ({
      category: typeof g.category === "string" ? g.category : "Autre",
      items: (Array.isArray(g.items) ? g.items : [])
        .filter((it): it is Record<string, unknown> => !!it && typeof it === "object")
        .map((it) => ({
          canonicalName: typeof it.canonicalName === "string" ? it.canonicalName : "",
          itemIds: (Array.isArray(it.itemIds) ? it.itemIds : []).filter(
            (id): id is string => typeof id === "string" && validIds.has(id),
          ),
        }))
        .filter((it) => it.canonicalName && it.itemIds.length > 0),
    }))
    .filter((g) => g.items.length > 0);
}
