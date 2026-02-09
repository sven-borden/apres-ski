"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AperoSection } from "@/components/feasts/AperoSection";
import { DinnerSection } from "@/components/feasts/DinnerSection";
import { ClaimModal } from "@/components/feasts/ClaimModal";
import { unclaimMeal } from "@/lib/actions/meals";
import type { Meal, Participant } from "@/lib/types";

export function DayMealCard({
  date,
  meal,
  participants,
  currentUserId,
}: {
  date: string;
  meal: Meal | undefined;
  participants: Participant[];
  currentUserId: string;
}) {
  const [claimSection, setClaimSection] = useState<"apero" | "dinner" | null>(
    null,
  );

  const longDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const currentUserName =
    participants.find((p) => p.id === currentUserId)?.name ?? "";

  const isAperoUser =
    meal?.apero?.assignedParticipantId === currentUserId;
  const isDinnerUser =
    meal?.dinner?.chefParticipantId === currentUserId;

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-midnight mb-4">
          {longDate}
        </h2>

        <div className="space-y-5">
          <AperoSection
            apero={meal?.apero}
            onClaim={() => setClaimSection("apero")}
            onUnclaim={() => unclaimMeal(date, "apero", currentUserName)}
            isCurrentUser={isAperoUser}
            participants={participants}
          />

          <hr className="border-mist/20" />

          <DinnerSection
            dinner={meal?.dinner}
            onClaim={() => setClaimSection("dinner")}
            onUnclaim={() => unclaimMeal(date, "dinner", currentUserName)}
            isCurrentUser={isDinnerUser}
            participants={participants}
          />
        </div>
      </Card>

      {claimSection && (
        <ClaimModal
          isOpen={!!claimSection}
          onClose={() => setClaimSection(null)}
          section={claimSection}
          date={date}
        />
      )}
    </>
  );
}
