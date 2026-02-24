"use client";

import { Suspense, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useMeals } from "@/lib/hooks/useMeals";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getDateRange, isToday } from "@/lib/utils/dates";
import { DateScroller } from "@/components/feasts/DateScroller";
import { DayMealCard } from "@/components/feasts/DayMealCard";
import { GeneralCard } from "@/components/feasts/GeneralCard";
import { ensureGeneralMeal } from "@/lib/actions/meals";

function getInitialDate(dates: string[]): string {
  const today = dates.find((d) => isToday(d));
  return today ?? dates[0] ?? "";
}

function FeastsContent() {
  const { trip, loading: tripLoading } = useTrip();
  const { meals, loading: mealsLoading } = useMeals();
  const { participants, loading: participantsLoading } = useParticipants();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const { t } = useLocale();

  useEffect(() => { ensureGeneralMeal(); }, []);

  const dates = useMemo(
    () => (trip ? getDateRange(trip.startDate, trip.endDate) : []),
    [trip],
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date");

  const resolvedDate = dateParam === "general" || (dateParam && dates.includes(dateParam))
    ? dateParam
    : "general";

  const setSelectedDate = useCallback((date: string) => {
    router.replace(`/feasts?date=${date}`);
  }, [router]);

  const totalPersonDays = useMemo(() => {
    return dates.reduce((sum, date) => {
      const presentCount = attendance.filter((a) => a.date === date && a.present).length;
      return sum + (presentCount > 0 ? presentCount : participants.length);
    }, 0);
  }, [dates, attendance, participants]);

  const loading = tripLoading || mealsLoading || participantsLoading || attendanceLoading;

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
        showGeneral
      />

      {resolvedDate === "general" ? (
        <GeneralCard meal={meals.find((m) => m.date === "general")} headcount={totalPersonDays} />
      ) : resolvedDate ? (
        <DayMealCard
          date={resolvedDate}
          meal={currentMeal}
          participants={participants}
          attendance={attendance}
        />
      ) : null}
    </div>
  );
}

export default function FeastsPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">{t.feasts.title}</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    }>
      <FeastsContent />
    </Suspense>
  );
}
