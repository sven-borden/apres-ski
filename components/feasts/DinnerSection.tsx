"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils/colors";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isDefined } from "@/lib/utils/typeGuards";
import type { Meal, Participant } from "@/lib/types";

export function DinnerSection({
  meal,
  participants,
  onEdit,
}: {
  meal: Meal | undefined;
  participants: Participant[];
  onEdit: () => void;
}) {
  const { t } = useLocale();
  const hasResponsible = meal && meal.responsibleIds.length > 0;
  const responsibleParticipants = useMemo(
    () =>
      hasResponsible
        ? meal.responsibleIds
            .map((id) => participants.find((p) => p.id === id))
            .filter(isDefined)
        : [],
    [meal, participants, hasResponsible],
  );

  return (
    <div className="border-l-4 border-alpine pl-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-midnight">{t.feasts.dinner}</h3>
        <Button
          variant="secondary"
          onClick={onEdit}
          className="text-xs px-3 py-1.5"
          aria-label={t.feasts.edit_dinner}
        >
          {t.common.edit}
        </Button>
      </div>

      {hasResponsible ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {responsibleParticipants.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <Avatar
                  initials={getInitials(p.name)}
                  color={p.color}
                  size="sm"
                />
                <span className="text-sm font-medium text-midnight">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
          {meal.description && (
            <p className="text-sm text-mist">{meal.description}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-mist py-1">{t.feasts.no_one_assigned}</p>
      )}
    </div>
  );
}
