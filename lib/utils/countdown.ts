import type { Translations } from "@/lib/i18n/locales";

const SKI_QUOTES: string[] = [
  "La raclette, c'est pas un repas, c'est un mode de vie",
  "Aujourd'hui : ski, bière, dodo. Dans cet ordre.",
  "Le seul cardio acceptable, c'est monter les pistes... en télésiège",
  "Si tu tombes, fais semblant que c'est voulu",
  "L'après-ski commence dès le matin si t'es courageux",
  "Pas besoin de wifi, on a de la neige",
  "Le fromage fondu guérit tout",
  "Jour de repos = jour de raclette supplémentaire",
  "Les courbatures, c'est juste le ski qui dit merci",
  "La montagne, c'est 20% de ski et 80% de fondue",
  "Qui dit chalet dit pas de règles",
  "On skie pour mériter la tartiflette",
  "Le générateur de bonne humeur : altitude + fromage",
  "Sourire obligatoire après la première descente",
  "Ici, l'heure de l'apéro c'est tout le temps",
];

export function getDailyQuote(dayNum: number): string {
  return SKI_QUOTES[(dayNum - 1) % SKI_QUOTES.length];
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Arrival time: 4pm Swiss time (CET = UTC+1 in winter)
const ARRIVAL_TIME = "T16:00:00+01:00";

export function getCountdownText(startDate: string, endDate: string, t: Translations): string {
  const today = new Date(`${getTodayString()}T00:00:00`);
  const start = new Date(`${startDate}${ARRIVAL_TIME}`);
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
  const start = new Date(`${startDate}${ARRIVAL_TIME}`);
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
  const startMidnight = new Date(`${startDate}T00:00:00`);
  const dayNum =
    Math.floor(
      (todayStart.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const totalDays =
    Math.floor(
      (new Date(`${endDate}T00:00:00`).getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return { state: "during", dayNum, totalDays };
}
