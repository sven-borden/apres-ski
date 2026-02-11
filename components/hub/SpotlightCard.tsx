"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, sortParticipants } from "@/lib/utils/colors";
import { formatDateShort } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { Participant, Meal } from "@/lib/types";

const MAX_AVATARS = 6;

export function SpotlightCard({
  date,
  badge,
  presentIds,
  allParticipants,
  meal,
  capacity,
}: {
  date: string;
  badge: "Today" | "Next Up" | string;
  presentIds: Set<string>;
  allParticipants: Participant[];
  meal: Meal | undefined;
  capacity: number | null;
}) {
  const presentParticipants = sortParticipants(
    allParticipants.filter((p) => presentIds.has(p.id)),
  );
  const overflow = presentParticipants.length - MAX_AVATARS;

  const responsibleNames =
    meal && meal.responsibleIds.length > 0
      ? meal.responsibleIds
          .map((id) => allParticipants.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => (p as Participant).name)
      : [];

  const itemCount = meal?.shoppingList?.length ?? 0;
  const checkedCount =
    meal?.shoppingList?.filter((i) => i.checked).length ?? 0;

  const isOverCapacity =
    capacity !== null && presentIds.size > capacity;

  return (
    <Card className="ring-2 ring-alpine">
      <div className="space-y-3">
        {/* Header: date + badge */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-midnight">
            {formatDateShort(date)}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-alpine text-white">
            {badge}
          </span>
        </div>

        {/* Avatar row + headcount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {presentParticipants.slice(0, MAX_AVATARS).map((p) => (
              <Avatar
                key={p.id}
                initials={getInitials(p.name)}
                color={p.color}
                size="sm"
              />
            ))}
            {overflow > 0 && (
              <div className="w-8 h-8 rounded-full bg-mist/30 flex items-center justify-center text-xs font-semibold text-midnight">
                +{overflow}
              </div>
            )}
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              isOverCapacity
                ? "bg-red-100 text-red-600"
                : "bg-pine/10 text-pine",
            )}
          >
            {capacity !== null
              ? `${presentIds.size}/${capacity}`
              : `${presentIds.size} going`}
          </span>
        </div>

        {/* Dinner summary */}
        <Link
          href="/feasts"
          className="block rounded-lg px-3 py-2 -mx-3 hover:bg-white/40 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {responsibleNames.length > 0 ? (
                <>
                  <span className="text-sm font-medium text-midnight">
                    {responsibleNames.join(", ")}
                  </span>
                  {meal?.description && (
                    <span className="text-sm text-mist">
                      {" "}
                      &mdash; {meal.description}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-mist">
                  No dinner planned yet
                </span>
              )}
            </div>
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

        {/* Shopping progress */}
        {meal && itemCount > 0 && (
          <Link
            href="/feasts"
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
