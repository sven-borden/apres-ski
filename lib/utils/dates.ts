import type { Locale } from "@/lib/i18n/locales";

export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  while (current <= last) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

const LOCALE_MAP: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

export function formatDateShort(dateStr: string, locale: Locale = "fr"): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(LOCALE_MAP[locale], { weekday: "short", day: "numeric" });
}

export function formatDateLong(dateStr: string, locale: Locale = "fr"): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(LOCALE_MAP[locale], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isToday(dateStr: string): boolean {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return dateStr === `${y}-${m}-${d}`;
}
