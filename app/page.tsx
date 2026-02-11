"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LiteHero } from "@/components/hub/LiteHero";
import { WeatherWidget } from "@/components/hub/WeatherWidget";
import { SpotlightCard } from "@/components/hub/SpotlightCard";
import { CrewStrip } from "@/components/hub/CrewStrip";
import { MealPlanStatus } from "@/components/hub/MealPlanStatus";
import { QuickInfoCard } from "@/components/hub/QuickInfoCard";
import { QuickActions } from "@/components/hub/QuickActions";
import { EditTripModal } from "@/components/basecamp/EditTripModal";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useMeals } from "@/lib/hooks/useMeals";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { getTodayString, getCountdownData } from "@/lib/utils/countdown";
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

  const countdown = useMemo(() => {
    if (!trip) return null;
    return getCountdownData(trip.startDate, trip.endDate);
  }, [trip]);

  // Spotlight: today during trip, first day before trip, hidden after
  const spotlight = useMemo(() => {
    if (!trip || !countdown) return null;
    if (countdown.state === "after") return null;

    if (countdown.state === "during") {
      return { date: today, badge: "Today" as const };
    }

    // before
    return { date: trip.startDate, badge: "Next Up" as const };
  }, [trip, countdown, today]);

  const capacity = basecamp?.capacity ?? null;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Hero + weather skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="h-8 w-48 rounded-lg bg-mist/20 animate-pulse" />
          <Card className="animate-pulse min-w-[220px]">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-mist/20" />
              <div className="h-8 w-16 rounded bg-mist/20" />
              <div className="h-3 w-32 rounded bg-mist/20" />
            </div>
          </Card>
        </div>
        {/* Spotlight skeleton */}
        <Card className="animate-pulse">
          <div className="space-y-3">
            <div className="h-5 w-32 rounded bg-mist/20" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-mist/20" />
              <div className="w-8 h-8 rounded-full bg-mist/20" />
              <div className="w-8 h-8 rounded-full bg-mist/20" />
            </div>
            <div className="h-4 w-48 rounded bg-mist/20" />
          </div>
        </Card>
        {/* Crew + info skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-mist/20" />
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded-full bg-mist/20" />
                <div className="w-8 h-8 rounded-full bg-mist/20" />
                <div className="w-8 h-8 rounded-full bg-mist/20" />
              </div>
            </div>
          </Card>
          <Card className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded bg-mist/20" />
              <div className="h-4 w-40 rounded bg-mist/20" />
            </div>
          </Card>
        </div>
        {/* Meal status skeleton */}
        <Card className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-mist/20" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-10 rounded bg-mist/20" />
              <div className="h-10 rounded bg-mist/20" />
              <div className="h-10 rounded bg-mist/20" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Hero + Weather */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
        <LiteHero
          tripName={trip?.name ?? null}
          startDate={trip?.startDate ?? null}
          endDate={trip?.endDate ?? null}
        />
        <WeatherWidget />
      </div>

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
        <>
          {/* 2. Spotlight */}
          {spotlight && (
            <SpotlightCard
              date={spotlight.date}
              badge={spotlight.badge}
              presentIds={attendanceByDate.get(spotlight.date) ?? new Set()}
              allParticipants={participants}
              meal={mealByDate.get(spotlight.date)}
              capacity={capacity}
            />
          )}

          {/* 3. Crew + Quick Info (2-col on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CrewStrip
              participants={participants}
              dates={dates}
              attendanceByDate={attendanceByDate}
              capacity={capacity}
              today={today}
            />
            {basecamp && <QuickInfoCard basecamp={basecamp} />}
          </div>

          {/* 4. Meal Plan Status */}
          <MealPlanStatus meals={meals} dates={dates} />

          {/* 5. Quick Actions */}
          <QuickActions />
        </>
      )}
    </div>
  );
}
