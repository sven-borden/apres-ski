"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LiteHero } from "@/components/hub/LiteHero";
import { WeatherWidget } from "@/components/hub/WeatherWidget";
import { SpotlightCard } from "@/components/hub/SpotlightCard";
import { CrewStrip } from "@/components/hub/CrewStrip";
import { MealPlanStatus } from "@/components/hub/MealPlanStatus";
import { ChaletSnippet } from "@/components/hub/ChaletSnippet";

import { EditTripModal } from "@/components/basecamp/EditTripModal";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useMeals } from "@/lib/hooks/useMeals";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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
  const { t } = useLocale();

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

  const scrollTarget = useMemo(() => {
    if (!trip || !countdown) return null;
    if (countdown.state === "during") return today;
    if (countdown.state === "before") return trip.startDate;
    return trip.startDate;
  }, [trip, countdown, today]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [scrollTarget]);

  const capacity = basecamp?.capacity ?? null;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Hero skeleton */}
        <div className="h-28 rounded-lg bg-mist/20 animate-pulse" />

        {/* Chalet + Weather skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionHeader title={t.hub.chalet} href="/basecamp" linkLabel={t.hub.more_info} />
            <div className="bg-glass backdrop-blur-md rounded-2xl shadow-lg overflow-hidden flex animate-pulse">
              <div className="flex-1 p-5 space-y-2">
                <div className="h-4 w-24 rounded bg-mist/20" />
                <div className="h-3 w-36 rounded bg-mist/20" />
                <div className="h-3 w-20 rounded bg-mist/20" />
              </div>
              <div className="shrink-0 w-1/3 bg-mist/20" />
            </div>
          </div>
          <div>
            <SectionHeader title={t.hub.weather} />
            <Card className="animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-mist/20" />
                <div className="h-8 w-16 rounded bg-mist/20" />
                <div className="h-3 w-32 rounded bg-mist/20" />
              </div>
            </Card>
          </div>
        </div>

        {/* Carousel skeleton */}
        <div>
          <SectionHeader title={t.hub.schedule} href="/lineup" />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shrink-0 w-72 animate-pulse">
                <div className="space-y-3">
                  <div className="h-5 w-32 rounded bg-mist/20" />
                  <div className="h-4 w-20 rounded bg-mist/20" />
                  <div className="h-4 w-48 rounded bg-mist/20" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Attendance skeleton */}
        <div>
          <SectionHeader title={t.hub.attendance} href="/crew" />
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
        </div>

        {/* Meal Plan skeleton */}
        <div>
          <SectionHeader title={t.hub.meal_plan} href="/feasts" />
          <Card className="animate-pulse">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-10 rounded bg-mist/20" />
                <div className="h-10 rounded bg-mist/20" />
                <div className="h-10 rounded bg-mist/20" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Hero */}
      <LiteHero
        tripName={trip?.name ?? null}
        startDate={trip?.startDate ?? null}
        endDate={trip?.endDate ?? null}
      />

      {/* 2. Chalet + Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {basecamp && (
          <div>
            <SectionHeader title={t.hub.chalet} href="/basecamp" linkLabel={t.hub.more_info} />
            <ChaletSnippet basecamp={basecamp} />
          </div>
        )}
        <div>
          <SectionHeader title={t.hub.weather} />
          <WeatherWidget />
        </div>
      </div>

      {!trip ? (
        <>
          <Card>
            <div className="text-center py-4">
              <p className="text-mist mb-4">
                {t.hub.no_trip}
              </p>
              <Button onClick={() => setTripModalOpen(true)}>
                {t.hub.set_up_trip}
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
          {/* 3. Date Carousel */}
          {dates.length > 0 && (
            <div>
              <SectionHeader title={t.hub.schedule} href="/lineup" />
              <div className="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
                {dates.map((date) => (
                  <div
                    key={date}
                    ref={date === scrollTarget ? scrollRef : undefined}
                    className="flex"
                  >
                    <SpotlightCard
                      date={date}
                      badge={
                        date === today && countdown?.state === "during"
                          ? t.hub.today
                          : undefined
                      }
                      highlighted={date === scrollTarget}
                      presentIds={attendanceByDate.get(date) ?? new Set()}
                      allParticipants={participants}
                      meal={mealByDate.get(date)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Attendance */}
          <div>
            <SectionHeader title={t.hub.attendance} href="/crew" />
            <CrewStrip
              participants={participants}
              dates={dates}
              attendanceByDate={attendanceByDate}
              capacity={capacity}
              today={today}
            />
          </div>

          {/* 5. Meal Plan */}
          <div>
            <SectionHeader title={t.hub.meal_plan} href="/feasts" />
            <MealPlanStatus meals={meals} dates={dates} />
          </div>
        </>
      )}
    </div>
  );
}
