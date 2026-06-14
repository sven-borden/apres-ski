/** Trip date helpers shared across live screens. Dates are YYYY-MM-DD. */

// Date-only strings are timezone-free. Iterate with a noon-UTC anchor so
// toISOString() never shifts the calendar date (a midnight anchor shifts a day
// back in any positive-offset timezone).
export function tripDays(startISO: string, endISO: string): string[] {
  if (!startISO || !endISO) return [];
  const out: string[] = [];
  const d = new Date(startISO + "T12:00:00Z");
  const end = new Date(endISO + "T12:00:00Z");
  if (isNaN(d.getTime()) || isNaN(end.getTime()) || end < d) return [];
  let guard = 0;
  while (d <= end && guard++ < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date (device "today", PROJECT.md §5.2). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from local today until the start (negative once started/past). */
export function daysUntil(startISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startISO + "T00:00:00");
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}

export type Countdown =
  | { phase: "before"; days: number }
  | { phase: "during"; dayNum: number; totalDays: number }
  | { phase: "after" };

/** Countdown state (PROJECT.md §5.2). */
export function countdown(startISO: string, endISO: string): Countdown {
  const today = todayISO();
  if (today > endISO) return { phase: "after" };
  const until = daysUntil(startISO);
  if (until > 0) return { phase: "before", days: until };
  const days = tripDays(startISO, endISO);
  const idx = days.indexOf(today);
  return { phase: "during", dayNum: idx >= 0 ? idx + 1 : 1, totalDays: days.length };
}
