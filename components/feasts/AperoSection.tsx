"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AperoAssignment, Participant } from "@/lib/types";

export function AperoSection({
  apero,
  onClaim,
  onUnclaim,
  isCurrentUser,
  participants,
}: {
  apero: AperoAssignment | undefined;
  onClaim: () => void;
  onUnclaim: () => void;
  isCurrentUser: boolean;
  participants: Participant[];
}) {
  const assigned = apero && apero.status !== "unassigned";
  const participant = assigned
    ? participants.find((p) => p.id === apero.assignedParticipantId)
    : undefined;

  return (
    <div className="border-l-4 border-spritz pl-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-midnight">Apero</h3>
        {assigned && <StatusBadge status={apero.status} />}
      </div>

      {assigned ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar
              initials={apero.assignedTo.charAt(0).toUpperCase()}
              color={participant?.color ?? "#94A3B8"}
              size="sm"
            />
            <span className="text-sm font-medium text-midnight">
              {apero.assignedTo}
            </span>
          </div>
          {apero.notes && (
            <p className="text-sm text-mist">{apero.notes}</p>
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
            Claim Apero
          </Button>
        </div>
      )}
    </div>
  );
}
