"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeroHeader } from "@/components/hub/HeroHeader";
import { TodaySnapshot } from "@/components/hub/TodaySnapshot";
import { QuickActions } from "@/components/hub/QuickActions";
import { EditTripModal } from "@/components/rostrum/EditTripModal";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useMeals } from "@/lib/hooks/useMeals";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { getCountdownText, getTodayString } from "@/lib/utils/countdown";
import type { Participant } from "@/lib/types";

export default function HubPage() {
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const { trip, loading: tripLoading } = useTrip();
  const { participants, loading: participantsLoading } = useParticipants();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const { meals, loading: mealsLoading } = useMeals();
  const { basecamp, loading: basecampLoading } = useBasecamp();

  const loading =
    tripLoading ||
    participantsLoading ||
    attendanceLoading ||
    mealsLoading ||
    basecampLoading;

  const countdownText = useMemo(() => {
    if (!trip) return null;
    return getCountdownText(trip.startDate, trip.endDate);
  }, [trip]);

  const today = useMemo(() => getTodayString(), []);

  const todayMeal = useMemo(
    () => meals.find((m) => m.date === today),
    [meals, today],
  );

  const { arrivals, departures } = useMemo(() => {
    if (!attendance.length || !participants.length) {
      return { arrivals: [] as Participant[], departures: [] as Participant[] };
    }

    const presentByParticipant = new Map<string, string[]>();
    for (const a of attendance) {
      if (!a.present) continue;
      const dates = presentByParticipant.get(a.participantId) || [];
      dates.push(a.date);
      presentByParticipant.set(a.participantId, dates);
    }

    const arrivingIds: string[] = [];
    const departingIds: string[] = [];

    for (const [pid, dates] of presentByParticipant) {
      dates.sort();
      if (dates[0] === today) arrivingIds.push(pid);
      if (dates[dates.length - 1] === today) departingIds.push(pid);
    }

    const participantMap = new Map(participants.map((p) => [p.id, p]));
    return {
      arrivals: arrivingIds
        .map((id) => participantMap.get(id))
        .filter((p): p is Participant => !!p),
      departures: departingIds
        .map((id) => participantMap.get(id))
        .filter((p): p is Participant => !!p),
    };
  }, [attendance, participants, today]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 rounded-2xl bg-gradient-to-br from-alpine to-midnight animate-pulse" />
        <Card className="animate-pulse h-32">
          <span />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HeroHeader
        tripName={trip?.name ?? null}
        countdownText={countdownText}
      />
      {!trip ? (
        <>
          <Card>
            <div className="text-center py-4">
              <p className="text-mist mb-4">No trip set up yet. Create one to get started!</p>
              <Button onClick={() => setTripModalOpen(true)}>Set Up Trip</Button>
            </div>
          </Card>
          <EditTripModal
            isOpen={tripModalOpen}
            onClose={() => setTripModalOpen(false)}
            trip={null}
          />
        </>
      ) : (
        <>
          <TodaySnapshot
            arrivals={arrivals}
            departures={departures}
            todayMeal={todayMeal}
            participants={participants}
          />
          <QuickActions basecamp={basecamp} />
        </>
      )}
    </div>
  );
}
