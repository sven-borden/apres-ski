"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function MealNudge({ unclaimedCount }: { unclaimedCount: number }) {
  const { t } = useLocale();

  if (unclaimedCount === 0) return null;

  const label =
    unclaimedCount === 1
      ? t.hub.meal_nudge_one
      : t.hub.meal_nudge(unclaimedCount);

  return (
    <Link
      href="/feasts"
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-glass backdrop-blur-sm border border-glass-border text-sm transition-colors hover:bg-white/80"
    >
      <span>
        <span className="mr-1.5">🍳</span>
        <span className="text-midnight">{label}</span>
      </span>
      <span className="text-alpine font-medium whitespace-nowrap">
        {t.hub.meal_nudge_cta} →
      </span>
    </Link>
  );
}
