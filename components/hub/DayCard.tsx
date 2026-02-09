"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { formatDateShort } from "@/lib/utils/dates";
import { AttendanceToggleList } from "@/components/hub/AttendanceToggleList";
import { DinnerSection } from "@/components/feasts/DinnerSection";
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

  return (
    <Card className={cn(isToday && "ring-2 ring-alpine")}>
      <div className="space-y-4">
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

        <AttendanceToggleList
          date={date}
          allParticipants={allParticipants}
          presentIds={presentIds}
          capacity={capacity}
        />

        <DinnerSection
          meal={meal}
          participants={allParticipants}
          onEdit={() => setEditOpen(true)}
        />

        {meal && (
          <ShoppingList date={date} items={meal.shoppingList ?? []} />
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
