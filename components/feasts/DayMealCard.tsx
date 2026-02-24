"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DinnerSection } from "@/components/feasts/DinnerSection";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import { EditDinnerModal } from "@/components/feasts/EditDinnerModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useUser } from "@/components/providers/UserProvider";
import { formatDateLong } from "@/lib/utils/dates";
import { toggleExcludeFromShopping } from "@/lib/actions/meals";
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
  const { user } = useUser();

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

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={meal?.excludeFromShopping ?? false}
              onClick={async () => {
                if (!user) return;
                await toggleExcludeFromShopping(
                  date,
                  !(meal?.excludeFromShopping ?? false),
                  user.name,
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                meal?.excludeFromShopping
                  ? "bg-alpine"
                  : "bg-mist/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  meal?.excludeFromShopping
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-midnight">
              {t.feasts.exclude_from_shopping}
            </span>
          </label>

          <hr className="border-mist/20" />

          <ShoppingList
            date={date}
            items={meal?.shoppingList ?? []}
            mealDescription={meal?.description ?? ""}
            headcount={headcount}
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
