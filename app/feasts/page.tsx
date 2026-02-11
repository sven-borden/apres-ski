"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useMeals } from "@/lib/hooks/useMeals";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getDateRange, isToday } from "@/lib/utils/dates";
import { DateScroller } from "@/components/feasts/DateScroller";
import { DayMealCard } from "@/components/feasts/DayMealCard";

function getInitialDate(dates: string[]): string {
  const today = dates.find((d) => isToday(d));
  return today ?? dates[0] ?? "";
}

function FeastsContent() {
  const { trip, loading: tripLoading } = useTrip();
  const { meals, loading: mealsLoading } = useMeals();
  const { participants, loading: participantsLoading } = useParticipants();
  const { t } = useLocale();
  const dates = useMemo(
    () => (trip ? getDateRange(trip.startDate, trip.endDate) : []),
    [trip],
  );

  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [selectedDate, setSelectedDate] = useState<string>("");

  const resolvedDate = selectedDate || (dateParam && dates.includes(dateParam) ? dateParam : getInitialDate(dates));

  const loading = tripLoading || mealsLoading || participantsLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.feasts.title}</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.feasts.title}</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-mist">{t.feasts.no_trip}</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentMeal = meals.find((m) => m.date === resolvedDate);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">{t.feasts.title}</h1>

      <DateScroller
        dates={dates}
        selectedDate={resolvedDate}
        onSelectDate={setSelectedDate}
      />

      {resolvedDate && (
        <DayMealCard
          date={resolvedDate}
          meal={currentMeal}
          participants={participants}
        />
      )}
    </div>
  );
}

export default function FeastsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Feasts</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    }>
      <FeastsContent />
    </Suspense>
  );
}
