import { describe, it, expect, vi, afterEach } from "vitest";
import { getDateRange, formatDateShort, formatDateLong, isToday } from "./dates";

describe("getDateRange", () => {
  it("returns single date when start equals end", () => {
    expect(getDateRange("2026-03-07", "2026-03-07")).toEqual(["2026-03-07"]);
  });

  it("returns range of dates", () => {
    expect(getDateRange("2026-03-07", "2026-03-09")).toEqual([
      "2026-03-07",
      "2026-03-08",
      "2026-03-09",
    ]);
  });

  it("handles month boundary", () => {
    const range = getDateRange("2026-02-27", "2026-03-02");
    expect(range).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
  });

  it("returns empty array when start > end", () => {
    expect(getDateRange("2026-03-10", "2026-03-07")).toEqual([]);
  });
});

describe("formatDateShort", () => {
  it("returns a non-empty string", () => {
    const result = formatDateShort("2026-03-07", "en");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the day number", () => {
    const result = formatDateShort("2026-03-07", "en");
    expect(result).toContain("7");
  });
});

describe("formatDateLong", () => {
  it("returns a non-empty string", () => {
    const result = formatDateLong("2026-03-07", "en");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the day number", () => {
    const result = formatDateLong("2026-03-15", "fr");
    expect(result).toContain("15");
  });
});

describe("isToday", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for today's date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T12:00:00"));
    expect(isToday("2026-03-07")).toBe(true);
  });

  it("returns false for a different date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T12:00:00"));
    expect(isToday("2026-03-08")).toBe(false);
  });
});
