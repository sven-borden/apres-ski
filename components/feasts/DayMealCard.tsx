"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DinnerSection } from "@/components/feasts/DinnerSection";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import { EditDinnerModal } from "@/components/feasts/EditDinnerModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatDateLong } from "@/lib/utils/dates";
import type { Attendance, Meal, Participant } from "@/lib/types";

export function DayMealCard({
  date,
  meal,
  participants,
  attendance,
}: {
  date: string;
  meal: Meal | undefined;
  participants: Participant[];
  attendance: Attendance[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const { locale, t } = useLocale();

  const longDate = formatDateLong(date, locale);
  const presentCount = attendance.filter((a) => a.date === date && a.present).length;
  const headcount = presentCount > 0 ? presentCount : participants.length;

  return (
    <>
      <Card>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-midnight">
            {longDate}
          </h2>
          <span className="text-sm text-mist">
            {t.feasts.headcount(headcount)}
          </span>
        </div>

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
            mealDescription={meal?.description ?? ""}
            headcount={headcount}
            excludeFromShopping={meal?.excludeFromShopping ?? false}
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
