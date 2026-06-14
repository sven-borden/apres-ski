import {
  headcount as presentCount,
  seedAttendance,
  seedParticipants,
  tripDays,
  type Participant,
} from "./crew";

/**
 * Placeholder meals + shopping. Swap for live PocketBase data later — see
 * PROJECT.md §2.4 (Meal), §2.5 (Shopping item), §4.2 / §4.6 (Feasts), §5.1
 * (headcount), §6.1 (AI estimate). Shapes mirror the eventual records.
 */

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

function item(text: string, extra: Partial<ShoppingItem> = {}): ShoppingItem {
  return { id: newItemId(), text, checked: false, ...extra };
}

function emptyMeal(date: string): Meal {
  return { date, chefs: [], description: "", shoppingList: [], excludeFromShopping: false };
}

/** Seed meals keyed by date, plus the special "general" meal. */
export function seedMeals(): Record<string, Meal> {
  const [d0, d1, d2, d3] = tripDays;
  const meals: Record<string, Meal> = {
    [d0]: {
      date: d0,
      chefs: ["p-lea"],
      description: "Raclette + salade verte",
      excludeFromShopping: false,
      shoppingList: [
        item("Fromage à raclette"),
        item("Pommes de terre", { quantity: 2, unit: "kg" }),
        item("Cornichons"),
        item("Vin blanc", { quantity: 2, unit: "bottles" }),
        item("Charcuterie"),
      ],
    },
    [d1]: {
      date: d1,
      chefs: ["p-tom", "p-marc"],
      description: "Fondue moitié-moitié",
      excludeFromShopping: false,
      shoppingList: [
        item("Fromage à fondue"),
        item("Pain", { quantity: 2, unit: "pcs" }),
        item("Ail"),
        item("Kirsch"),
        item("Vin blanc", { quantity: 1, unit: "bottles", checked: true }),
      ],
    },
    [d2]: emptyMeal(d2),
    [d3]: {
      date: d3,
      chefs: ["p-sofia"],
      description: "Curry de légumes + riz",
      excludeFromShopping: false,
      shoppingList: [
        item("Riz"),
        item("Lait de coco"),
        item("Légumes de saison"),
        item("Pâte de curry"),
      ],
    },
    [GENERAL]: {
      date: GENERAL,
      chefs: [],
      description: "",
      excludeFromShopping: false,
      shoppingList: [
        item("Chips & crackers"),
        item("Bière", { quantity: 24, unit: "bottles" }),
        item("Pain de mie"),
        item("Jambon"),
        item("Café", { checked: true }),
        item("Œufs"),
        item("Lait", { checked: true }),
        item("Beurre"),
        item("Patates"),
      ],
    },
  };
  return meals;
}

/** Effective headcount for one day (PROJECT.md §5.1). */
export function dayHeadcount(
  date: string,
  attendance: Set<string> = seedAttendance,
  roster: Participant[] = seedParticipants,
): number {
  const present = presentCount(date, attendance, roster);
  return present > 0 ? present : roster.length;
}

/** Total person-days across the trip (PROJECT.md §5.1, general list). */
export function personDays(
  attendance: Set<string> = seedAttendance,
  roster: Participant[] = seedParticipants,
): number {
  return tripDays.reduce((sum, d) => sum + dayHeadcount(d, attendance, roster), 0);
}

/* ── Mock AI quantity estimator (PROJECT.md §6.1) ─────────────────────────
   Placeholder for the server-side LLM call. Deterministic heuristic from
   headcount + item keywords; fills only items that lack a quantity. Swap for
   the real rate-limited /api endpoint later. */

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
