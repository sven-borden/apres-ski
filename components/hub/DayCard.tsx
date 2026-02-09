"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { formatDateShort } from "@/lib/utils/dates";
import { EditDinnerModal } from "@/components/feasts/EditDinnerModal";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import type { Meal, Participant } from "@/lib/types";

export function DayCard({
  date,
  presentIds,
  allParticipants,
  meal,
  capacity,
  isToday,
}: {
  date: string;
  presentIds: Set<string>;
  allParticipants: Participant[];
  meal: Meal | undefined;
  capacity: number | null;
  isToday: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);

  const responsibleNames =
    meal && meal.responsibleIds.length > 0
      ? meal.responsibleIds
          .map((id) => allParticipants.find((p) => p.id === id))
          .filter(Boolean)
          .map((p) => (p as Participant).name)
      : [];

  const itemCount = meal?.shoppingList?.length ?? 0;

  return (
    <Card className={cn(isToday && "ring-2 ring-alpine")}>
      <div className="space-y-2">
        {/* Row 1 — Date + capacity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-midnight">
              {formatDateShort(date)}
            </h2>
            {isToday && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-alpine text-white">
                Today
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              capacity !== null && presentIds.size > capacity
                ? "bg-red-100 text-red-600"
                : "bg-alpine/10 text-alpine",
            )}
          >
            {capacity !== null
              ? `${presentIds.size}/${capacity}`
              : presentIds.size}
          </span>
        </div>

        {/* Row 2 — Dinner summary (tappable) */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 -mx-3 hover:bg-powder transition-colors text-left"
        >
          <div className="min-w-0 flex-1">
            {responsibleNames.length > 0 ? (
              <>
                <span className="text-sm font-medium text-midnight">
                  {responsibleNames.join(", ")}
                </span>
                {meal?.description && (
                  <span className="text-sm text-mist"> — {meal.description}</span>
                )}
              </>
            ) : (
              <span className="text-sm text-mist">No dinner planned</span>
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
            <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
          </svg>
        </button>

        {/* Row 3 — Collapsible shopping list */}
        {meal && (
          <div>
            <button
              type="button"
              onClick={() => setShoppingOpen(!shoppingOpen)}
              className="flex items-center gap-1.5 text-sm text-mist hover:text-midnight transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-transform",
                  shoppingOpen && "rotate-90",
                )}
              >
                <path d="M5 3l4 4-4 4" />
              </svg>
              Shopping list ({itemCount} {itemCount === 1 ? "item" : "items"})
            </button>
            {shoppingOpen && (
              <div className="mt-2">
                <ShoppingList date={date} items={meal.shoppingList ?? []} />
              </div>
            )}
          </div>
        )}

        <EditDinnerModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          date={date}
          meal={meal}
          participants={allParticipants}
        />
      </div>
    </Card>
  );
}
