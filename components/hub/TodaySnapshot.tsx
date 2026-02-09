"use client";

import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials, sortParticipants } from "@/lib/utils/colors";
import type { Participant, Meal } from "@/lib/types";

export function TodaySnapshot({
  arrivals,
  departures,
  todayMeal,
  participants,
}: {
  arrivals: Participant[];
  departures: Participant[];
  todayMeal: Meal | undefined;
  participants: Participant[];
}) {
  const dinnerClaimed = todayMeal?.dinner.status !== "unassigned";
  const aperoClaimed = todayMeal?.apero.status !== "unassigned";

  const chefParticipant = dinnerClaimed
    ? participants.find((p) => p.id === todayMeal?.dinner.chefParticipantId)
    : undefined;

  const aperoParticipant = aperoClaimed
    ? participants.find((p) => p.id === todayMeal?.apero.assignedParticipantId)
    : undefined;

  const hasContent =
    arrivals.length > 0 ||
    departures.length > 0 ||
    dinnerClaimed ||
    aperoClaimed;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-midnight mb-3">Today</h2>
      {!hasContent ? (
        <p className="text-mist text-sm">Nothing scheduled for today</p>
      ) : (
        <div className="space-y-3">
          {arrivals.length > 0 && (
            <Row
              icon={
                <div className="w-8 h-8 rounded-full bg-alpine/10 flex items-center justify-center text-alpine">
                  <ArrowDownIcon />
                </div>
              }
              label="Arriving"
              participants={arrivals}
            />
          )}
          {departures.length > 0 && (
            <Row
              icon={
                <div className="w-8 h-8 rounded-full bg-pine/10 flex items-center justify-center text-pine">
                  <ArrowUpIcon />
                </div>
              }
              label="Departing"
              participants={departures}
            />
          )}
          {dinnerClaimed && todayMeal && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-alpine/10 flex items-center justify-center text-alpine">
                <ChefIcon />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {chefParticipant && (
                  <Avatar
                    initials={getInitials(chefParticipant.name)}
                    color={chefParticipant.color}
                    size="sm"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-midnight">
                    Dinner — {todayMeal.dinner.chefName}
                  </p>
                  {todayMeal.dinner.menu && (
                    <p className="text-xs text-mist truncate">
                      {todayMeal.dinner.menu}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {aperoClaimed && todayMeal && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-spritz/10 flex items-center justify-center text-spritz">
                <GlassIcon />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {aperoParticipant && (
                  <Avatar
                    initials={getInitials(aperoParticipant.name)}
                    color={aperoParticipant.color}
                    size="sm"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-midnight">
                    Apero — {todayMeal.apero.assignedTo}
                  </p>
                  {todayMeal.apero.notes && (
                    <p className="text-xs text-mist truncate">
                      {todayMeal.apero.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Row({
  icon,
  label,
  participants,
}: {
  icon: React.ReactNode;
  label: string;
  participants: Participant[];
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex -space-x-2">
          {sortParticipants(participants).slice(0, 5).map((p) => (
            <Avatar
              key={p.id}
              initials={getInitials(p.name)}
              color={p.color}
              size="sm"
            />
          ))}
        </div>
        <p className="text-sm text-midnight truncate">
          <span className="font-medium">{label}:</span>{" "}
          {participants.map((p) => p.name).join(", ")}
        </p>
      </div>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v10M4 9l4 4 4-4" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13V3M4 7l4-4 4 4" />
    </svg>
  );
}

function ChefIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14h6M4 10h8M5 10V7M11 10V7" />
      <circle cx="8" cy="4" r="2.5" />
    </svg>
  );
}

function GlassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2l1.5 6H10.5L12 2H4zM7.5 8v5M5.5 13h4" />
    </svg>
  );
}
