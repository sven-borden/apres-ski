import { describe, it, expect, vi, afterEach } from "vitest";
import { getDailyQuote, getTodayString, getCountdownData, getCountdownText } from "./countdown";
import type { Translations } from "@/lib/i18n/locales";

const mockT = {
  countdown: {
    in_days: (n: number) => (n === 1 ? "IN 1 DAY" : `IN ${n} DAYS`),
    day_of: (cur: number, total: number) => `DAY ${cur} / ${total}`,
    hope_fun: "Hope you had fun!",
  },
} as Translations;

describe("getDailyQuote", () => {
  it("returns first quote for day 1", () => {
    const q1 = getDailyQuote(1);
    expect(q1).toBe("La raclette, c'est pas un repas, c'est un mode de vie");
  });

  it("wraps around after 15 quotes (day 16 = day 1)", () => {
    expect(getDailyQuote(16)).toBe(getDailyQuote(1));
  });

  it("returns different quotes for different days", () => {
    expect(getDailyQuote(1)).not.toBe(getDailyQuote(2));
  });
});

describe("getTodayString", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns YYYY-MM-DD format with zero-padding", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T10:00:00"));
    expect(getTodayString()).toBe("2026-03-07");
  });

  it("zero-pads single-digit months and days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T10:00:00"));
    expect(getTodayString()).toBe("2026-01-05");
  });
});

describe("getCountdownData", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'before' state with days and hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T10:00:00"));
    const data = getCountdownData("2026-03-07", "2026-03-14");
    expect(data.state).toBe("before");
    if (data.state === "before") {
      expect(data.days).toBeGreaterThan(0);
      expect(data.hours).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns 'during' state with dayNum and totalDays", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-09T10:00:00"));
    const data = getCountdownData("2026-03-07", "2026-03-14");
    expect(data.state).toBe("during");
    if (data.state === "during") {
      expect(data.dayNum).toBe(3);
      expect(data.totalDays).toBe(8);
    }
  });

  it("returns 'after' state when trip is over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T10:00:00"));
    const data = getCountdownData("2026-03-07", "2026-03-14");
    expect(data).toEqual({ state: "after" });
  });
});

describe("getCountdownText", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns days countdown before trip", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T10:00:00"));
    const text = getCountdownText("2026-03-07", "2026-03-14", mockT);
    expect(text).toMatch(/^IN \d+ DAYS?$/);
  });

  it("returns day X of Y during trip", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T10:00:00"));
    const text = getCountdownText("2026-03-07", "2026-03-14", mockT);
    expect(text).toMatch(/^DAY \d+ \/ \d+$/);
  });

  it("returns hope fun message after trip", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T10:00:00"));
    const text = getCountdownText("2026-03-07", "2026-03-14", mockT);
    expect(text).toBe("Hope you had fun!");
  });
});
