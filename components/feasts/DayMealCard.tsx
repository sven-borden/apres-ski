"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DinnerSection } from "@/components/feasts/DinnerSection";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import { EditDinnerModal } from "@/components/feasts/EditDinnerModal";
import type { Meal, Participant } from "@/lib/types";

export function DayMealCard({
  date,
  meal,
  participants,
}: {
  date: string;
  meal: Meal | undefined;
  participants: Participant[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  const longDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-midnight mb-4">
          {longDate}
        </h2>

        <div className="space-y-5">
          <DinnerSection
            meal={meal}
            participants={participants}
            onEdit={() => setEditOpen(true)}
          />

          <hr className="border-mist/20" />

          <ShoppingList
            date={date}
            items={meal?.shoppingList ?? []}
          />
        </div>
      </Card>

      <EditDinnerModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        date={date}
        meal={meal}
        participants={participants}
      />
    </>
  );
}
