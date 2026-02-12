"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatDateShort } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { updateDinner } from "@/lib/actions/meals";
import type { Participant, Meal } from "@/lib/types";

export function SpotlightCard({
  date,
  badge,
  highlighted = false,
  presentIds,
  allParticipants,
  meal,
}: {
  date: string;
  badge?: string;
  highlighted?: boolean;
  presentIds: Set<string>;
  allParticipants: Participant[];
  meal: Meal | undefined;
}) {
  const { user } = useUser();
  const { locale, t } = useLocale();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responsibleNames =
    meal && meal.responsibleIds.length > 0
      ? meal.responsibleIds
          .map((id) => allParticipants.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => (p as Participant).name)
      : [];

  async function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || claiming) return;
    setClaiming(true);
    setError(null);
    try {
      await updateDinner(
        date,
        { responsibleIds: [user.id], description: "" },
        user.id,
      );
    } catch {
      setError(t.errors.claim_failed);
      setTimeout(() => setError(null), 3000);
    } finally {
      setClaiming(false);
    }
  }

  const itemCount = meal?.shoppingList?.length ?? 0;
  const checkedCount =
    meal?.shoppingList?.filter((i) => i.checked).length ?? 0;

  return (
    <Card className={cn("shrink-0 w-[38vw] min-w-[160px] md:w-72 h-full", highlighted && "border-2 border-alpine")}>
      <div className="space-y-3">
        {/* Header: date + headcount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-midnight">
              {formatDateShort(date, locale)}
            </h2>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-alpine text-white">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-midnight">
            <span className="mr-1">{"\u26F7\uFE0F"}</span>
            <span className="font-bold">{presentIds.size}</span>
          </p>
        </div>

        {/* Dinner summary */}
        {responsibleNames.length > 0 ? (
          <Link
            href={`/feasts?date=${date}`}
            className="block rounded-lg px-3 py-2 -mx-3 hover:bg-white/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-midnight min-w-0 flex-1">
                <span className="text-mist">{t.hub.dinner_by}</span>{" "}
                <span className="font-medium">{responsibleNames.join(", ")}</span>
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-mist"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </div>
          </Link>
        ) : (
          <div className="space-y-2 px-3 py-2 -mx-3">
            <span className="text-sm text-mist block">{t.hub.no_dinner}</span>
            {user && (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-alpine/10 text-alpine hover:bg-alpine/20 transition-colors disabled:opacity-50"
              >
                {claiming ? t.hub.claiming : t.hub.i_cook_tonight}
              </button>
            )}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
            )}
          </div>
        )}

        {/* Shopping progress */}
        {meal && itemCount > 0 && (
          <Link
            href={`/feasts?date=${date}`}
            className="flex items-center gap-2 text-sm text-mist hover:text-midnight transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="6" cy="14" r="1" />
              <circle cx="13" cy="14" r="1" />
              <path d="M1 1h2l1.68 8.39a1 1 0 001 .81h7.72a1 1 0 00.98-.78L15.5 5H4" />
            </svg>
            <div className="flex-1 h-1.5 rounded-full bg-mist/20">
              <div
                className="h-full rounded-full bg-pine transition-all"
                style={{
                  width: `${Math.round((checkedCount / itemCount) * 100)}%`,
                }}
              />
            </div>
            <span className="shrink-0 text-xs tabular-nums">
              {checkedCount}/{itemCount}
            </span>
          </Link>
        )}
      </div>
    </Card>
  );
}
