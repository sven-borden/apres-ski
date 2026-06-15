/** Meal + shopping types and the closed unit set (PROJECT.md §2.4–2.5). */

export const GENERAL = "general" as const;

/** Closed unit set (PROJECT.md §2.5) with French display labels. */
export const UNITS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "dL", label: "dL" },
  { value: "cl", label: "cl" },
  { value: "pcs", label: "pièces" },
  { value: "bottles", label: "bouteilles" },
  { value: "packs", label: "paquets" },
] as const;

export type Unit = (typeof UNITS)[number]["value"];

export type ShoppingItem = {
  id: string;
  text: string;
  checked: boolean;
  quantity?: number;
  unit?: Unit;
};

export type Meal = {
  date: string; // YYYY-MM-DD or "general"
  chefs: string[]; // participant ids
  description: string;
  shoppingList: ShoppingItem[];
  excludeFromShopping: boolean;
};

let counter = 0;
export function newItemId() {
  counter += 1;
  return `item-${Date.now().toString(36)}-${counter}`;
}

/* ── Mock AI quantity estimator (PROJECT.md §6.1) ─────────────────────────
   Local fallback / placeholder for the server-side LLM call. Deterministic
   heuristic from headcount + item keywords; fills only items lacking a
   quantity. Replaced by the /api/ai/estimate endpoint. */

type Bucket = { unit: Unit; perPerson: number; round: (n: number) => number };

const ceil = (n: number) => Math.ceil(n);
const toKgOr = (grams: number) =>
  grams >= 1000
    ? { quantity: Math.round((grams / 1000) * 10) / 10, unit: "kg" as Unit }
    : { quantity: Math.round(grams / 50) * 50, unit: "g" as Unit };

const KEYWORDS: { match: RegExp; bucket: Bucket }[] = [
  { match: /vin|bière|biere|kirsch|jus|soda|eau|champagne|prosecco/i, bucket: { unit: "bottles", perPerson: 0.4, round: ceil } },
  { match: /œuf|oeuf|egg/i, bucket: { unit: "pcs", perPerson: 2, round: ceil } },
  { match: /lait|coco|crème|creme|bouillon/i, bucket: { unit: "dL", perPerson: 1.5, round: (n) => Math.round(n) } },
  { match: /pain|baguette/i, bucket: { unit: "pcs", perPerson: 0.4, round: ceil } },
  { match: /fromage|gruyère|gruyere|raclette|fondue|viande|poulet|poisson|jambon|charcuterie|lardons/i, bucket: { unit: "g", perPerson: 200, round: () => 0 } },
  { match: /pomme de terre|patate|riz|pâtes|pates|pasta|légume|legume/i, bucket: { unit: "g", perPerson: 220, round: () => 0 } },
  { match: /chips|crackers|snack|cornichon|salade|beurre|café|cafe|thé|the|curry|ail|sauce|épice|epice/i, bucket: { unit: "packs", perPerson: 0, round: () => 1 } },
];

export type Estimate = { id: string; quantity: number | null; unit: Unit | null };

/** Returns estimates for items lacking a quantity. Generous "hungry skiers". */
export function estimateQuantities(
  category: "dinner" | "general",
  headcount: number,
  items: { id: string; text: string }[],
): Estimate[] {
  const factor = category === "dinner" ? 1.25 : 1; // generous portions after the slopes
  return items.map(({ id, text }) => {
    const hit = KEYWORDS.find((k) => k.match.test(text));
    if (!hit) return { id, quantity: ceil(headcount * 0.5 * factor) || 1, unit: "packs" };
    const { unit, perPerson } = hit.bucket;
    if (unit === "g") {
      const grams = perPerson * headcount * factor;
      const { quantity, unit: u } = toKgOr(grams);
      return { id, quantity, unit: u };
    }
    if (unit === "packs") return { id, quantity: Math.max(1, ceil(headcount / 6)), unit: "packs" };
    const raw = perPerson * headcount * factor;
    return { id, quantity: hit.bucket.round(raw) || 1, unit };
  });
}
