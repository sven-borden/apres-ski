import { GENERAL, type Meal, type ShoppingItem, type Unit } from "./feasts";

/**
 * Consolidated shopping logic (PROJECT.md §4.3, §5.3, §6.2). Pure functions over
 * the meals model so the screen stays thin. The Smart Merge here is a local mock
 * of the server-side LLM (§6.2); swap for the real /api endpoint later.
 */

export type Source = {
  date: string;
  label: string; // e.g. "Jeu. 25 · Raclette" or "Général"
  item: ShoppingItem;
};

export type Line = {
  key: string;
  name: string;
  sources: Source[];
  checkedCount: number;
  total: number;
  done: boolean; // all sources bought
  partial: boolean; // some but not all
  quantity: string | null; // summed display, §5.3
};

const fmtShort = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function mealLabel(meal: Meal): string {
  if (meal.date === GENERAL) return "Général";
  const d = fmtShort.format(new Date(meal.date + "T00:00:00")).replace(".", "");
  return meal.description ? `${d} · ${meal.description}` : d;
}

/* ── Quantity summing across unit families (§5.3) ─────────────────────────── */

const COUNT: Unit[] = ["pcs", "bottles", "packs"];

const round2 = (n: number) => Math.round(n * 100) / 100;
const countLabel = (n: number, unit: Unit) => {
  const singular: Partial<Record<Unit, string>> = { bottles: "bouteille", packs: "paquet", pcs: "pièce" };
  const plural: Partial<Record<Unit, string>> = { bottles: "bouteilles", packs: "paquets", pcs: "pièces" };
  return n === 1 ? singular[unit] : plural[unit];
};

export function sumQuantities(items: { quantity?: number; unit?: Unit }[]): string | null {
  let grams = 0;
  let cl = 0;
  const counts: Record<string, number> = { pcs: 0, bottles: 0, packs: 0 };
  let any = false;

  for (const it of items) {
    if (it.quantity == null) continue;
    any = true;
    const q = it.quantity;
    const u = it.unit;
    if (u === "g") grams += q;
    else if (u === "kg") grams += q * 1000;
    else if (u === "cl") cl += q;
    else if (u === "dL") cl += q * 10;
    else if (u === "L") cl += q * 100;
    else if (u && COUNT.includes(u)) counts[u] += q;
    else counts.pcs += q; // unitless → pieces
  }
  if (!any) return null;

  const parts: string[] = [];
  if (grams > 0) parts.push(grams >= 1000 ? `${round2(grams / 1000)} kg` : `${round2(grams)} g`);
  if (cl > 0) {
    if (cl >= 100) parts.push(`${round2(cl / 100)} L`);
    else if (cl % 10 === 0) parts.push(`${cl / 10} dL`);
    else parts.push(`${round2(cl)} cl`);
  }
  for (const u of COUNT) {
    if (counts[u] > 0) parts.push(`${counts[u]} ${countLabel(counts[u], u as Unit)}`);
  }
  return parts.length ? parts.join(" + ") : null;
}

/* ── Consolidation (§4.3) ─────────────────────────────────────────────────── */

/** Flatten all meals (skipping excluded days) and merge by normalized text. */
export function consolidate(meals: Record<string, Meal>): Line[] {
  const groups = new Map<string, Source[]>();
  for (const meal of Object.values(meals)) {
    if (meal.excludeFromShopping) continue;
    const label = mealLabel(meal);
    for (const item of meal.shoppingList) {
      const key = normalize(item.text);
      if (!key) continue;
      const arr = groups.get(key) ?? [];
      arr.push({ date: meal.date, label, item });
      groups.set(key, arr);
    }
  }
  return [...groups.entries()].map(([key, sources]) => buildLine(key, sources[0].item.text, sources));
}

function buildLine(key: string, name: string, sources: Source[]): Line {
  const checkedCount = sources.filter((s) => s.item.checked).length;
  const total = sources.length;
  return {
    key,
    name,
    sources,
    checkedCount,
    total,
    done: checkedCount === total,
    partial: checkedCount > 0 && checkedCount < total,
    quantity: sumQuantities(sources.map((s) => s.item)),
  };
}

/* ── Smart Merge: mock AI grouping + categorisation (§6.2) ─────────────────── */

export type Category = { id: string; label: string };

/** Grocery aisle order (FR). */
export const CATEGORIES: Category[] = [
  { id: "produce", label: "Fruits & Légumes" },
  { id: "dairy", label: "Crémerie" },
  { id: "meatfish", label: "Viande & Poisson" },
  { id: "bakery", label: "Boulangerie" },
  { id: "pantry", label: "Épicerie" },
  { id: "beverages", label: "Boissons" },
  { id: "frozen", label: "Surgelés" },
  { id: "snacks", label: "Apéro & Snacks" },
  { id: "condiments", label: "Condiments & Sauces" },
  { id: "other", label: "Autre" },
];

const CATEGORY_RULES: { id: string; match: RegExp }[] = [
  { id: "produce", match: /pomme de terre|patate|légume|legume|salade|tomate|oignon|ail|carotte|fruit|pomme|banane/i },
  { id: "dairy", match: /lait|crème|creme|fromage|raclette|fondue|beurre|yaourt|œuf|oeuf/i },
  { id: "meatfish", match: /viande|poulet|boeuf|bœuf|poisson|jambon|charcuterie|lardons|saucisse/i },
  { id: "bakery", match: /pain|baguette|brioche|croissant/i },
  { id: "beverages", match: /vin|bière|biere|kirsch|jus|soda|eau|café|cafe|thé|the|champagne/i },
  { id: "frozen", match: /surgelé|surgele|glace|frites/i },
  { id: "snacks", match: /chips|crackers|cornichon|snack|apéro|apero|biscuit/i },
  { id: "condiments", match: /sauce|huile|vinaigre|moutarde|épice|epice|curry|sel|poivre|sucre/i },
  { id: "pantry", match: /riz|pâtes|pates|pasta|farine|coco|conserve|bouillon|céréale/i },
];

function categoryFor(name: string): string {
  return CATEGORY_RULES.find((r) => r.match.test(name))?.id ?? "other";
}

// Cross-language / variant synonyms → canonical display name.
const SYNONYMS: { match: RegExp; canonical: string }[] = [
  { match: /patate|pomme de terre|potato/i, canonical: "Pommes de terre" },
  { match: /vin blanc|white wine/i, canonical: "Vin blanc" },
  { match: /fromage à raclette|raclette cheese/i, canonical: "Fromage à raclette" },
];

function canonicalName(name: string): string {
  return SYNONYMS.find((s) => s.match.test(name))?.canonical ?? name;
}

export type MergedGroup = { category: Category; lines: Line[] };

/** Mock of the server LLM: merge similar lines, categorise, return aisle order. */
export function smartMerge(lines: Line[]): MergedGroup[] {
  // Merge lines that share a canonical name.
  const byCanonical = new Map<string, Line>();
  for (const line of lines) {
    const canonical = canonicalName(line.name);
    const existing = byCanonical.get(canonical.toLowerCase());
    if (existing) {
      const sources = [...existing.sources, ...line.sources];
      byCanonical.set(canonical.toLowerCase(), buildLine(existing.key, canonical, sources));
    } else {
      byCanonical.set(canonical.toLowerCase(), buildLine(line.key, canonical, line.sources));
    }
  }

  // Bucket by category, preserving aisle order, dropping empty categories.
  const buckets = new Map<string, Line[]>();
  for (const line of byCanonical.values()) {
    const cat = categoryFor(line.name);
    const arr = buckets.get(cat) ?? [];
    arr.push(line);
    buckets.set(cat, arr);
  }
  return CATEGORIES.filter((c) => buckets.has(c.id)).map((category) => ({
    category,
    lines: buckets.get(category.id)!.sort((a, b) => a.name.localeCompare(b.name, "fr")),
  }));
}

/** Map the AI endpoint's grouping back onto our Line objects (§6.2). */
export function applyAiMerge(
  lines: Line[],
  groups: { category: string; items: { canonicalName: string; itemIds: string[] }[] }[],
): MergedGroup[] {
  const byKey = new Map(lines.map((l) => [l.key, l]));
  const used = new Set<string>();
  const out: MergedGroup[] = [];

  for (const g of groups) {
    const groupLines: Line[] = [];
    for (const item of g.items) {
      const sources = item.itemIds.flatMap((id) => {
        const l = byKey.get(id);
        if (!l) return [];
        used.add(id);
        return l.sources;
      });
      if (sources.length) groupLines.push(buildLine(item.itemIds[0], item.canonicalName, sources));
    }
    if (groupLines.length) {
      out.push({ category: { id: g.category.toLowerCase(), label: g.category }, lines: groupLines });
    }
  }

  const leftover = lines.filter((l) => !used.has(l.key));
  if (leftover.length) out.push({ category: { id: "other", label: "Autre" }, lines: leftover });
  return out;
}

/** Fingerprint for caching the merge (§6.2): item set + locale. */
export function fingerprint(lines: Line[], locale = "fr"): string {
  return locale + "|" + lines.map((l) => normalize(l.name)).sort().join(",");
}
