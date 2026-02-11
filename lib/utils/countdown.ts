import type { Translations } from "@/lib/i18n/locales";

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCountdownText(startDate: string, endDate: string, t: Translations): string {
  const today = new Date(`${getTodayString()}T00:00:00`);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (today < start) {
    const diff = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return t.countdown.in_days(diff);
  }

  if (today > end) {
    return t.countdown.hope_fun;
  }

  const dayNum =
    Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const totalDays =
    Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return t.countdown.day_of(dayNum, totalDays);
}

export type CountdownData =
  | { state: "before"; days: number; hours: number }
  | { state: "during"; dayNum: number; totalDays: number }
  | { state: "after" };

export function getCountdownData(startDate: string, endDate: string): CountdownData {
  const now = new Date();
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (now < start) {
    const diffMs = start.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { state: "before", days, hours };
  }

  if (now > end) {
    return { state: "after" };
  }

  const todayStart = new Date(`${getTodayString()}T00:00:00`);
  const dayNum =
    Math.floor(
      (todayStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const totalDays =
    Math.floor(
      (new Date(`${endDate}T00:00:00`).getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return { state: "during", dayNum, totalDays };
}
