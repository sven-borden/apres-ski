"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DinnerSection } from "@/components/feasts/DinnerSection";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import { EditDinnerModal } from "@/components/feasts/EditDinnerModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatDateLong } from "@/lib/utils/dates";
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
  const { locale } = useLocale();

  const longDate = formatDateLong(date, locale);

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
        key={date}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        date={date}
        meal={meal}
        participants={participants}
      />
    </>
  );
}
