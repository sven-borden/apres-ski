"use client";

import { Card } from "@/components/ui/Card";
import { ShoppingList } from "@/components/feasts/ShoppingList";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Meal } from "@/lib/types";

export function GeneralCard({ meal }: { meal: Meal | undefined }) {
  const { t } = useLocale();

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-midnight">
          {t.feasts.general}
        </h2>
        <p className="text-sm text-mist">{t.feasts.general_subtitle}</p>
      </div>

      <ShoppingList
        date="general"
        items={meal?.shoppingList ?? []}
        mealDescription=""
        headcount={0}
      />
    </Card>
  );
}
