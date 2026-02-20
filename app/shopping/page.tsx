"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useMeals } from "@/lib/hooks/useMeals";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { toggleShoppingItem } from "@/lib/actions/meals";
import type { ShoppingItem } from "@/lib/types";

type FlatItem = ShoppingItem & { date: string };

function formatMealDate(dateStr: string, locale: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg
      aria-hidden="true"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-mist/40"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function ShoppingPage() {
  const { trip, loading: tripLoading } = useTrip();
  const { meals, loading: mealsLoading } = useMeals();
  const { user } = useUser();
  const { t, locale } = useLocale();
  const [error, setError] = useState<string | null>(null);

  const loading = tripLoading || mealsLoading;

  const allItems = useMemo<FlatItem[]>(() => {
    return meals
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((meal) =>
        meal.shoppingList.map((item) => ({ ...item, date: meal.date })),
      );
  }, [meals]);

  const unchecked = useMemo(() => allItems.filter((i) => !i.checked), [allItems]);
  const checked = useMemo(() => allItems.filter((i) => i.checked), [allItems]);

  const groupedUnchecked = useMemo(() => {
    const map = new Map<string, FlatItem[]>();
    for (const item of unchecked) {
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date)!.push(item);
    }
    return [...map.entries()];
  }, [unchecked]);

  const userId = user?.id ?? "anonymous";

  async function handleToggle(date: string, itemId: string) {
    try {
      await toggleShoppingItem(date, itemId, userId);
    } catch {
      setError(t.errors.toggle_failed);
      setTimeout(() => setError(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>
        <Card className="animate-pulse h-20">
          <span />
        </Card>
        <Card className="animate-pulse h-48">
          <span />
        </Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-mist">{t.shopping.no_trip}</p>
          </div>
        </Card>
      </div>
    );
  }

  const allDone = allItems.length > 0 && unchecked.length === 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">{t.shopping.title}</h1>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Summary card */}
      <Card>
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <EmptyCartIcon />
            <p className="text-mist text-sm text-center">{t.shopping.no_items}</p>
            <Link
              href="/feasts"
              className="text-alpine text-sm font-medium hover:text-alpine/80 transition-colors"
            >
              {t.feasts.title} →
            </Link>
          </div>
        ) : allDone ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pine/15 flex items-center justify-center text-pine shrink-0">
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="font-semibold text-pine">{t.shopping.all_done}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-midnight">
                {t.shopping.items_remaining(unchecked.length)}
              </span>
              {checked.length > 0 && (
                <span className="text-xs text-mist">
                  {checked.length}&thinsp;/&thinsp;{allItems.length}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-mist/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-pine rounded-full transition-all duration-500"
                style={{
                  width: `${(checked.length / allItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Unchecked items grouped by dinner date */}
      {groupedUnchecked.map(([date, items]) => (
        <Card key={date}>
          <div className="space-y-3">
            {/* Meal date header — links to the feast */}
            <Link
              href={`/feasts?date=${date}`}
              className="flex items-center gap-2 group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-alpine group-hover:text-alpine/70 transition-colors">
                {t.feasts.dinner}
              </span>
              <span className="text-mist/50 text-xs">·</span>
              <span className="text-xs font-medium text-midnight capitalize">
                {formatMealDate(date, locale)}
              </span>
              <span className="ml-auto text-mist group-hover:text-alpine transition-colors">
                <ChevronRightIcon />
              </span>
            </Link>

            {/* Item list */}
            <ul className="divide-y divide-mist/10 -mx-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5 px-1">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={false}
                    aria-label={t.feasts.mark_purchased(item.text)}
                    onClick={() => handleToggle(item.date, item.id)}
                    className="w-5 h-5 rounded border-2 border-mist/40 flex items-center justify-center shrink-0 hover:border-alpine transition-colors"
                  />
                  <span className="flex-1 text-sm text-midnight leading-snug">
                    {item.text}
                  </span>
                  {item.quantity != null && (
                    <span className="text-xs font-semibold text-alpine shrink-0">
                      {item.quantity}
                      {item.unit ? `\u00a0${item.unit}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}

      {/* Purchased section */}
      {checked.length > 0 && (
        <Card className={cn(unchecked.length === 0 ? "" : "opacity-75")}>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-mist">
              {t.shopping.purchased} ({checked.length})
            </h3>
            <ul className="divide-y divide-mist/10 -mx-1">
              {checked.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5 px-1">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={true}
                    aria-label={t.feasts.mark_unpurchased(item.text)}
                    onClick={() => handleToggle(item.date, item.id)}
                    className="w-5 h-5 rounded border-2 bg-pine border-pine flex items-center justify-center shrink-0 text-white hover:bg-pine/80 transition-colors"
                  >
                    <CheckIcon />
                  </button>
                  <span className="flex-1 text-sm text-mist line-through leading-snug">
                    {item.text}
                  </span>
                  {item.quantity != null && (
                    <span className="text-xs text-mist/60 shrink-0">
                      {item.quantity}
                      {item.unit ? `\u00a0${item.unit}` : ""}
                    </span>
                  )}
                  <span className="text-[10px] text-mist/50 shrink-0 capitalize hidden sm:block">
                    {formatMealDate(item.date, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
