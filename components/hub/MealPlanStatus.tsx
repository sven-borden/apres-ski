"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatDateShort } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { Meal } from "@/lib/types";

export function MealPlanStatus({
  meals,
  dates,
}: {
  meals: Meal[];
  dates: string[];
}) {
  const mealByDate = new Map(meals.map((m) => [m.date, m]));

  const assigned = dates.filter((d) => {
    const m = mealByDate.get(d);
    return m && m.responsibleIds.length > 0;
  });
  const unassigned = dates.filter((d) => {
    const m = mealByDate.get(d);
    return !m || m.responsibleIds.length === 0;
  });

  const totalItems = meals.reduce(
    (sum, m) => sum + (m.shoppingList?.length ?? 0),
    0,
  );
  const checkedItems = meals.reduce(
    (sum, m) => sum + (m.shoppingList?.filter((i) => i.checked).length ?? 0),
    0,
  );

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-midnight">Meal Plan</h3>
          <Link
            href="/feasts"
            className="text-xs font-medium text-alpine hover:text-alpine/80 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-pine">{assigned.length}</p>
            <p className="text-[11px] text-mist">Assigned</p>
          </div>
          <div>
            <p
              className={cn(
                "text-2xl font-bold",
                unassigned.length > 0 ? "text-spritz" : "text-pine",
              )}
            >
              {unassigned.length}
            </p>
            <p className="text-[11px] text-mist">Unassigned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-midnight">
              {totalItems > 0
                ? `${Math.round((checkedItems / totalItems) * 100)}%`
                : "--"}
            </p>
            <p className="text-[11px] text-mist">Shopped</p>
          </div>
        </div>

        {/* Unassigned date pills */}
        {unassigned.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map((d) => (
              <span
                key={d}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-spritz/10 text-spritz"
              >
                {formatDateShort(d)}
              </span>
            ))}
          </div>
        )}

        {/* Overall shopping bar */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-mist"
            >
              <circle cx="6" cy="14" r="1" />
              <circle cx="13" cy="14" r="1" />
              <path d="M1 1h2l1.68 8.39a1 1 0 001 .81h7.72a1 1 0 00.98-.78L15.5 5H4" />
            </svg>
            <div className="flex-1 h-1.5 rounded-full bg-mist/20">
              <div
                className="h-full rounded-full bg-pine transition-all"
                style={{
                  width: `${Math.round((checkedItems / totalItems) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs text-mist tabular-nums">
              {checkedItems}/{totalItems}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
