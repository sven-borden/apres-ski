import type { ShoppingUnit } from "@/lib/types";

interface QuantityEntry {
  quantity?: number;
  unit?: ShoppingUnit;
}

interface SumResult {
  total: number;
  unit: ShoppingUnit;
}

interface BreakdownEntry {
  total: number;
  unit: ShoppingUnit;
}

export type SumOutput =
  | { kind: "single"; result: SumResult }
  | { kind: "breakdown"; entries: BreakdownEntry[] }
  | null;

// ── Unit families ───────────────────────────────────────────────────────

const massToGrams: Record<string, number> = { g: 1, kg: 1000 };
const volumeToCl: Record<string, number> = { cl: 1, dL: 10, L: 100 };

function isMass(u: string): boolean {
  return u in massToGrams;
}

function isVolume(u: string): boolean {
  return u in volumeToCl;
}

// ── Display helpers ─────────────────────────────────────────────────────

function bestMassDisplay(grams: number): SumResult {
  if (grams >= 1000) {
    const kg = Math.round((grams / 1000) * 100) / 100;
    return { total: kg, unit: "kg" };
  }
  return { total: Math.round(grams * 100) / 100, unit: "g" };
}

function bestVolumeDisplay(cl: number): SumResult {
  if (cl >= 100) {
    const l = Math.round((cl / 100) * 100) / 100;
    return { total: l, unit: "L" };
  }
  if (cl >= 10 && cl % 10 === 0) {
    return { total: cl / 10, unit: "dL" };
  }
  return { total: Math.round(cl * 100) / 100, unit: "cl" };
}

// ── Public API ──────────────────────────────────────────────────────────

export function sumQuantities(items: QuantityEntry[]): SumOutput {
  const withQty = items.filter(
    (i): i is { quantity: number; unit?: ShoppingUnit } =>
      i.quantity != null && i.quantity > 0,
  );

  if (withQty.length === 0) return null;

  // Group by unit family
  let massGrams = 0;
  let volumeCl = 0;
  let hasMass = false;
  let hasVolume = false;
  const countBuckets = new Map<string, number>();

  for (const item of withQty) {
    const u = item.unit;
    if (!u) {
      // No unit — treat as unitless count
      countBuckets.set("", (countBuckets.get("") ?? 0) + item.quantity);
    } else if (isMass(u)) {
      hasMass = true;
      massGrams += item.quantity * massToGrams[u];
    } else if (isVolume(u)) {
      hasVolume = true;
      volumeCl += item.quantity * volumeToCl[u];
    } else {
      // Count units (pcs, bottles, packs) — only sum same unit
      countBuckets.set(u, (countBuckets.get(u) ?? 0) + item.quantity);
    }
  }

  const parts: BreakdownEntry[] = [];
  if (hasMass) parts.push(bestMassDisplay(massGrams));
  if (hasVolume) parts.push(bestVolumeDisplay(volumeCl));
  for (const [unit, total] of countBuckets) {
    if (unit === "") {
      parts.push({ total, unit: "pcs" as ShoppingUnit });
    } else {
      parts.push({ total, unit: unit as ShoppingUnit });
    }
  }

  if (parts.length === 0) return null;
  if (parts.length === 1) return { kind: "single", result: parts[0] };
  return { kind: "breakdown", entries: parts };
}
