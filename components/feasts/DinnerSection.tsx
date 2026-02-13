"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/ui/Avatar";
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
        <h3 className="font-semibold text-midnight">{meal?.description || t.feasts.dinner}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-mist hover:text-alpine transition-colors p-1 shrink-0"
          aria-label={t.feasts.edit_dinner}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
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
        </div>
      ) : (
        <p className="text-sm text-mist py-1">{t.feasts.no_one_assigned}</p>
      )}
    </div>
  );
}
