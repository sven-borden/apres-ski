"use client";

import Link from "next/link";
import { useState } from "react";
import { AvatarStack } from "@/components/avatar";
import { Button } from "@/components/button";
import { TripEditor, type TripDraft } from "@/components/basecamp/trip-editor";
import {
  useAttendance,
  useBasecamp,
  useMeals,
  useParticipants,
  useTrip,
  useWeather,
} from "@/lib/hooks/data";
import { saveTrip } from "@/lib/actions";
import { useLocalUser } from "@/lib/user";
import { countdown, tripDays } from "@/lib/trip-utils";
import { weatherEmoji, snowVibe } from "@/lib/weather-display";
import type { MealRecord } from "@/lib/pb/types";

const arr = <T,>(v: T[] | "" | undefined | null): T[] => (Array.isArray(v) ? v : []);
const fmtRange = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });

export default function Hub() {
  const trip = useTrip();
  const participants = useParticipants();
  const attendance = useAttendance();
  const meals = useMeals();
  const weather = useWeather();
  const basecamp = useBasecamp();
  const me = useLocalUser();

  const [setupOpen, setSetupOpen] = useState(false);
  const [setupKey, setSetupKey] = useState(0);

  function openSetup() {
    setSetupKey((k) => k + 1);
    setSetupOpen(true);
  }

  async function onSaveTrip(d: TripDraft) {
    await saveTrip({ name: d.name, startDate: d.startISO, endDate: d.endISO, updatedBy: me?.id });
    setSetupOpen(false);
    trip.refresh();
    meals.refresh();
  }

  const editor = (
    <TripEditor
      key={setupKey}
      open={setupOpen}
      initial={
        trip.data
          ? { name: trip.data.name, startISO: trip.data.startDate, endISO: trip.data.endDate }
          : { name: "", startISO: "", endISO: "" }
      }
      assignedMealDates={arr(meals.data)
        .filter((m) => arr(m.responsibleIds).length > 0)
        .map((m) => m.date)}
      onClose={() => setSetupOpen(false)}
      onSave={onSaveTrip}
    />
  );

  if (trip.loading && !trip.data) {
    return <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface" />;
  }

  if (!trip.data) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-16 text-center">
        <span className="text-5xl" aria-hidden>🏔️</span>
        <div className="flex max-w-sm flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight">Prêt pour la montagne&nbsp;?</h1>
          <p className="text-ink-muted">Crée le séjour : dates, puis l’équipe et les repas suivent.</p>
        </div>
        <Button onClick={openSetup}>Configurer le séjour</Button>
        {editor}
      </div>
    );
  }

  const t = trip.data;
  const days = tripDays(t.startDate, t.endDate);
  const cd = countdown(t.startDate, t.endDate);
  const today = new Date().toISOString().slice(0, 10);

  const presentByDate: Record<string, { name: string; color: string }[]> = {};
  for (const a of arr(attendance.data)) {
    if (a.present) (presentByDate[a.date] ||= []).push({ name: a.participantName || "?", color: a.participantColor || "oklch(0.6 0.02 250)" });
  }
  const mealByDate: Record<string, MealRecord> = {};
  for (const m of arr(meals.data)) mealByDate[m.date] = m;
  const nameById = new Map(arr(participants.data).map((p) => [p.id, p.name]));
  const capacity = basecamp.data?.capacity || arr(participants.data).length || 0;
  const unassigned = days.filter((d) => arr(mealByDate[d]?.responsibleIds).length === 0).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero / countdown */}
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-8 sm:px-9 sm:py-11">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full blur-3xl" style={{ background: "var(--accent-glow)" }} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-muted">Le séjour</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{t.name}</h1>
            <p className="nums mt-1 text-ink-muted">
              {fmtRange.format(new Date(t.startDate + "T00:00:00"))} – {fmtRange.format(new Date(t.endDate + "T00:00:00"))}
            </p>
          </div>
          <Button variant="secondary" onClick={openSetup} className="h-9 min-h-0 px-3 text-xs">Modifier</Button>
        </div>

        <div className="mt-7">
          {cd.phase === "before" && (
            <div className="flex items-end gap-3">
              <span className="nums font-[family-name:var(--font-display)] text-[clamp(3rem,16vw,5rem)] font-extrabold leading-none text-accent-ink">{cd.days}</span>
              <span className="mb-2 text-lg font-semibold text-ink-muted">{cd.days === 1 ? "jour" : "jours"} avant de chausser les skis</span>
            </div>
          )}
          {cd.phase === "during" && (
            <div className="flex items-end gap-3">
              <span className="font-[family-name:var(--font-display)] text-[clamp(2rem,10vw,3.5rem)] font-extrabold leading-none text-accent-ink">
                Jour <span className="nums">{cd.dayNum}</span>
              </span>
              <span className="nums mb-2 text-lg font-semibold text-ink-muted">sur {cd.totalDays}</span>
            </div>
          )}
          {cd.phase === "after" && <p className="text-2xl font-bold text-ink-muted">J’espère que c’était beau là-haut ✨</p>}
        </div>
      </section>

      {/* Meal nudge */}
      {unassigned > 0 && (
        <Link href="/feasts" className="group flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/8 px-5 py-4 transition-colors duration-[var(--t-base)] hover:bg-accent/12">
          <div>
            <p className="font-semibold text-accent-ink">{unassigned} {unassigned === 1 ? "soir cherche" : "soirs cherchent"} encore un chef 🍳</p>
            <p className="text-sm text-ink-muted">Quelqu’un pour réclamer un fourneau&nbsp;?</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-transform duration-[var(--t-fast)] group-hover:translate-x-0.5">Cuisiner</span>
        </Link>
      )}

      {/* Chalet snippet */}
      {basecamp.data && (
        <Link href="/basecamp" className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2">
          <span className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>🏡</span>
            <span>
              <span className="block font-semibold">{basecamp.data.name || "Le chalet"}</span>
              <span className="block truncate text-sm text-ink-muted">{(basecamp.data.address || "").split("\n")[0] || "Voir les infos"}</span>
            </span>
          </span>
          <span className="text-ink-muted">→</span>
        </Link>
      )}

      {/* Day carousel */}
      {days.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Le programme</h2>
            <span className="nums text-sm text-ink-muted">{days.length} jours</span>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
            {days.map((d, i) => {
              const date = new Date(d + "T00:00:00");
              const present = presentByDate[d] ?? [];
              const meal = mealByDate[d];
              const chefs = arr(meal?.responsibleIds).map((id) => nameById.get(id)).filter(Boolean);
              const isToday = d === today;
              return (
                <article key={d} className={`flex min-w-[15rem] snap-start flex-col gap-3 rounded-[var(--radius-md)] border bg-surface p-4 ${isToday ? "border-accent ring-1 ring-accent/40" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-display)] text-base font-bold capitalize">{fmtDay.format(date)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isToday ? "bg-accent text-on-accent" : "bg-surface-2 text-ink-muted"}`}>{isToday ? "Auj." : `Jour ${i + 1}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {present.length > 0 ? <AvatarStack people={present} size={28} /> : <span className="text-xs text-ink-muted">personne marqué</span>}
                    <span className="nums text-xs text-ink-muted">{present.length}/{capacity || "–"}</span>
                  </div>
                  <div className="mt-auto rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2.5">
                    {meal?.description ? (
                      <>
                        <p className="text-sm font-medium leading-snug">{meal.description}</p>
                        {chefs.length > 0 && <p className="mt-0.5 text-xs text-ink-muted">Chef&nbsp;: {chefs.join(", ")}</p>}
                      </>
                    ) : (
                      <p className="text-sm font-medium text-accent-ink">Soir libre — à réserver</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Weather */}
      {weather.data && (
        <section className="flex items-center gap-5 rounded-[var(--radius-md)] border border-border bg-surface p-5">
          <span className="text-5xl" aria-hidden>{weatherEmoji(weather.data.weatherCode).emoji}</span>
          <div className="flex-1">
            <p className="font-bold">{snowVibe(weather.data.snowDepth)}</p>
            <p className="text-sm text-ink-muted">
              {weatherEmoji(weather.data.weatherCode).label} · <span className="nums">{weather.data.temperature}°C</span>{" "}
              (<span className="nums">{weather.data.temperatureMin}°/{weather.data.temperatureMax}°</span>) · limite{" "}
              <span className="nums">{weather.data.freezingLevel} m</span>
            </p>
          </div>
          <span className="nums rounded-[var(--radius-sm)] bg-cold/12 px-3 py-2 text-center">
            <span className="block text-xl font-extrabold leading-none text-cold">{weather.data.snowDepth}</span>
            <span className="text-[11px] font-medium text-ink-muted">cm</span>
          </span>
        </section>
      )}

      {editor}
    </div>
  );
}
