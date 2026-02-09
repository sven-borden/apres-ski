"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DietaryTag } from "@/components/ui/DietaryTag";
import type { DinnerAssignment, Participant } from "@/lib/types";

export function DinnerSection({
  dinner,
  onClaim,
  onUnclaim,
  isCurrentUser,
  participants,
}: {
  dinner: DinnerAssignment | undefined;
  onClaim: () => void;
  onUnclaim: () => void;
  isCurrentUser: boolean;
  participants: Participant[];
}) {
  const assigned = dinner && dinner.status !== "unassigned";
  const participant = assigned
    ? participants.find((p) => p.id === dinner.chefParticipantId)
    : undefined;

  return (
    <div className="border-l-4 border-alpine pl-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-midnight">Dinner</h3>
        {assigned && <StatusBadge status={dinner.status} />}
      </div>

      {assigned ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar
              initials={dinner.chefName.charAt(0).toUpperCase()}
              color={participant?.color ?? "#94A3B8"}
              size="sm"
            />
            <span className="text-sm font-medium text-midnight">
              {dinner.chefName}
            </span>
          </div>
          {dinner.menu && (
            <p className="text-sm text-mist">{dinner.menu}</p>
          )}
          {dinner.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dinner.dietaryTags.map((tag) => (
                <DietaryTag key={tag} label={tag} />
              ))}
            </div>
          )}
          {isCurrentUser && (
            <Button variant="secondary" onClick={onUnclaim} className="text-xs px-3 py-1.5">
              Unclaim
            </Button>
          )}
        </div>
      ) : (
        <div className="py-2">
          <Button onClick={onClaim} className="text-sm">
            Claim Dinner
          </Button>
        </div>
      )}
    </div>
  );
}
