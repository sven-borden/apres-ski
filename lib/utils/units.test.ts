import { describe, it, expect } from "vitest";
import { sumQuantities } from "./units";

describe("sumQuantities", () => {
  it("returns null for empty array", () => {
    expect(sumQuantities([])).toBeNull();
  });

  it("returns null when no items have quantities", () => {
    expect(sumQuantities([{ unit: "g" }, { quantity: 0, unit: "kg" }])).toBeNull();
  });

  // ── Mass family ─────────────────────────────────────────────────────

  it("sums grams together", () => {
    const result = sumQuantities([
      { quantity: 200, unit: "g" },
      { quantity: 300, unit: "g" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 500, unit: "g" } });
  });

  it("converts to kg at 1000g threshold", () => {
    const result = sumQuantities([
      { quantity: 600, unit: "g" },
      { quantity: 500, unit: "g" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 1.1, unit: "kg" } });
  });

  it("merges g + kg", () => {
    const result = sumQuantities([
      { quantity: 500, unit: "g" },
      { quantity: 2, unit: "kg" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 2.5, unit: "kg" } });
  });

  // ── Volume family ───────────────────────────────────────────────────

  it("sums cl together", () => {
    const result = sumQuantities([
      { quantity: 25, unit: "cl" },
      { quantity: 25, unit: "cl" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 5, unit: "dL" } });
  });

  it("converts to L at 100cl threshold", () => {
    const result = sumQuantities([
      { quantity: 75, unit: "cl" },
      { quantity: 50, unit: "cl" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 1.25, unit: "L" } });
  });

  it("merges cl + L", () => {
    const result = sumQuantities([
      { quantity: 50, unit: "cl" },
      { quantity: 1, unit: "L" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 1.5, unit: "L" } });
  });

  it("keeps cl when below dL threshold", () => {
    const result = sumQuantities([{ quantity: 5, unit: "cl" }]);
    expect(result).toEqual({ kind: "single", result: { total: 5, unit: "cl" } });
  });

  // ── Count units ─────────────────────────────────────────────────────

  it("sums same count unit (bottles)", () => {
    const result = sumQuantities([
      { quantity: 2, unit: "bottles" },
      { quantity: 3, unit: "bottles" },
    ]);
    expect(result).toEqual({ kind: "single", result: { total: 5, unit: "bottles" } });
  });

  it("treats unitless items as pcs", () => {
    const result = sumQuantities([{ quantity: 3 }, { quantity: 2 }]);
    expect(result).toEqual({ kind: "single", result: { total: 5, unit: "pcs" } });
  });

  // ── Breakdown (mixed families) ─────────────────────────────────────

  it("returns breakdown for mass + volume", () => {
    const result = sumQuantities([
      { quantity: 500, unit: "g" },
      { quantity: 50, unit: "cl" },
    ]);
    expect(result).toEqual({
      kind: "breakdown",
      entries: [
        { total: 500, unit: "g" },
        { total: 5, unit: "dL" },
      ],
    });
  });

  it("returns breakdown for mass + count", () => {
    const result = sumQuantities([
      { quantity: 1, unit: "kg" },
      { quantity: 3, unit: "packs" },
    ]);
    expect(result).toEqual({
      kind: "breakdown",
      entries: [
        { total: 1, unit: "kg" },
        { total: 3, unit: "packs" },
      ],
    });
  });

  it("returns breakdown for different count units", () => {
    const result = sumQuantities([
      { quantity: 2, unit: "bottles" },
      { quantity: 1, unit: "packs" },
    ]);
    expect(result).toEqual({
      kind: "breakdown",
      entries: [
        { total: 2, unit: "bottles" },
        { total: 1, unit: "packs" },
      ],
    });
  });
});
