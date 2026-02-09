"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LiteHero } from "@/components/hub/LiteHero";
import { DayCard } from "@/components/hub/DayCard";
import { EditTripModal } from "@/components/basecamp/EditTripModal";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useMeals } from "@/lib/hooks/useMeals";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { getCountdownText, getTodayString } from "@/lib/utils/countdown";
import { getDateRange } from "@/lib/utils/dates";
import type { Meal } from "@/lib/types";

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

  const dates = useMemo(() => {
    if (!trip) return [];
    return getDateRange(trip.startDate, trip.endDate);
  }, [trip]);

  const attendanceByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of attendance) {
      if (!a.present) continue;
      const set = map.get(a.date) ?? new Set<string>();
      set.add(a.participantId);
      map.set(a.date, set);
    }
    return map;
  }, [attendance]);

  const mealByDate = useMemo(() => {
    const map = new Map<string, Meal>();
    for (const m of meals) {
      map.set(m.date, m);
    }
    return map;
  }, [meals]);

  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  const capacity = basecamp?.capacity ?? null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-mist/20 animate-pulse" />
        <Card className="animate-pulse h-48">
          <span />
        </Card>
        <Card className="animate-pulse h-48">
          <span />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LiteHero
        tripName={trip?.name ?? null}
        countdownText={countdownText}
      />
      {!trip ? (
        <>
          <Card>
            <div className="text-center py-4">
              <p className="text-mist mb-4">
                No trip set up yet. Create one to get started!
              </p>
              <Button onClick={() => setTripModalOpen(true)}>
                Set Up Trip
              </Button>
            </div>
          </Card>
          <EditTripModal
            isOpen={tripModalOpen}
            onClose={() => setTripModalOpen(false)}
            trip={null}
          />
        </>
      ) : (
        dates.map((date) => {
          const isTodayDate = date === today;
          return (
            <div key={date} ref={isTodayDate ? todayRef : undefined}>
              <DayCard
                date={date}
                presentIds={attendanceByDate.get(date) ?? new Set()}
                allParticipants={participants}
                meal={mealByDate.get(date)}
                capacity={capacity}
                isToday={isTodayDate}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
