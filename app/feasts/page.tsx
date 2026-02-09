"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useMeals } from "@/lib/hooks/useMeals";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { getDateRange, isToday } from "@/lib/utils/dates";
import { DateScroller } from "@/components/feasts/DateScroller";
import { DayMealCard } from "@/components/feasts/DayMealCard";

function getInitialDate(dates: string[]): string {
  const today = dates.find((d) => isToday(d));
  return today ?? dates[0] ?? "";
}

export default function FeastsPage() {
  const { trip, loading: tripLoading } = useTrip();
  const { meals, loading: mealsLoading } = useMeals();
  const { participants, loading: participantsLoading } = useParticipants();
  const dates = useMemo(
    () => (trip ? getDateRange(trip.startDate, trip.endDate) : []),
    [trip],
  );

  const [selectedDate, setSelectedDate] = useState<string>("");

  // Set initial date once dates are available
  const resolvedDate = selectedDate || getInitialDate(dates);

  const loading = tripLoading || mealsLoading || participantsLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Feasts</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Feasts</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-mist">No trip set up yet — head to Basecamp to create one</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentMeal = meals.find((m) => m.date === resolvedDate);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">Feasts</h1>

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
