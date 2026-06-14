"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { AvatarStack } from "@/components/avatar";
import { DinnerEditor } from "@/components/feasts/dinner-editor";
import { ShoppingList } from "@/components/feasts/shopping-list";
import { seedParticipants, sortParticipants, tripDays, type Participant } from "@/lib/crew";
import {
  GENERAL,
  dayHeadcount,
  personDays,
  seedMeals,
  type Meal,
  type ShoppingItem,
} from "@/lib/feasts";

const fmtChipWeekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const fmtChipDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function resolveSelected(param: string | null): string {
  if (param === GENERAL) return GENERAL;
  if (param && tripDays.includes(param)) return param;
  if (param) return GENERAL; // invalid date string
  const today = todayISO();
  return tripDays.includes(today) ? today : tripDays[0];
}

export function FeastsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const selected = resolveSelected(params.get("date"));

  const participants = useMemo(() => sortParticipants(seedParticipants), []);
  const [meals, setMeals] = useState<Record<string, Meal>>(() => seedMeals());
  const [editingDinner, setEditingDinner] = useState(false);
  const [dinnerKey, setDinnerKey] = useState(0);

  const isGeneral = selected === GENERAL;
  const meal = meals[selected];

  function select(date: string) {
    router.replace(`/feasts?date=${date}`, { scroll: false });
  }

  function updateMeal(key: string, patch: Partial<Meal>) {
    setMeals((m) => ({ ...m, [key]: { ...m[key], ...patch } }));
  }

  function setItems(items: ShoppingItem[]) {
    updateMeal(selected, { shoppingList: items });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Repas</h1>
        <p className="text-ink-muted">Qui cuisine, et la liste de courses de chaque soir.</p>
      </header>

      <DateScroller selected={selected} onSelect={select} meals={meals} />

      {isGeneral ? (
        <GeneralCard
          meal={meal}
          setItems={setItems}
          headcount={personDays()}
        />
      ) : (
        <DayCard
          meal={meal}
          participants={participants}
          headcount={dayHeadcount(selected)}
          onEditDinner={() => {
            setDinnerKey((k) => k + 1);
            setEditingDinner(true);
          }}
          setItems={setItems}
          onToggleExclude={(v) => updateMeal(selected, { excludeFromShopping: v })}
        />
      )}

      <p className="text-center text-xs text-ink-muted">
        Aperçu de démonstration — données fictives en attendant la connexion au backend.
      </p>

      {!isGeneral && meal && (
        <DinnerEditor
          key={dinnerKey}
          open={editingDinner}
          participants={participants}
          initialChefs={meal.chefs}
          initialDescription={meal.description}
          onClose={() => setEditingDinner(false)}
          onSave={(chefs, description) => {
            updateMeal(selected, { chefs, description });
            setEditingDinner(false);
          }}
        />
      )}
    </div>
  );
}

function DateScroller({
  selected,
  onSelect,
  meals,
}: {
  selected: string;
  onSelect: (d: string) => void;
  meals: Record<string, Meal>;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const today = todayISO();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <div
      className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0"
      role="tablist"
      aria-label="Jours du séjour"
    >
      {tripDays.map((d) => {
        const date = new Date(d + "T00:00:00");
        const active = selected === d;
        const assigned = meals[d]?.chefs.length > 0;
        return (
          <button
            key={d}
            ref={active ? activeRef : undefined}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(d)}
            className={`flex snap-start flex-col items-center rounded-[var(--radius-md)] border px-3.5 py-2 transition-colors duration-[var(--t-fast)] ${
              active
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-ink hover:bg-surface-2"
            }`}
          >
            <span className={`text-[11px] font-medium capitalize ${active ? "text-on-accent/80" : "text-ink-muted"}`}>
              {fmtChipWeekday.format(date).replace(".", "")}
            </span>
            <span className="nums font-[family-name:var(--font-display)] text-lg font-bold leading-tight">
              {fmtChipDay.format(date)}
            </span>
            <span className="mt-0.5 flex h-1.5 items-center">
              {d === today ? (
                <span className={`text-[8px] font-bold uppercase ${active ? "text-on-accent" : "text-accent-ink"}`}>auj.</span>
              ) : (
                <span className={`size-1.5 rounded-full ${assigned ? (active ? "bg-on-accent/80" : "bg-present") : "bg-transparent"}`} />
              )}
            </span>
          </button>
        );
      })}
      <button
        ref={selected === GENERAL ? activeRef : undefined}
        role="tab"
        aria-selected={selected === GENERAL}
        onClick={() => onSelect(GENERAL)}
        className={`flex snap-start flex-col items-center justify-center rounded-[var(--radius-md)] border px-4 py-2 text-center transition-colors duration-[var(--t-fast)] ${
          selected === GENERAL
            ? "border-accent bg-accent text-on-accent"
            : "border-border bg-surface text-ink hover:bg-surface-2"
        }`}
      >
        <span className="text-lg leading-none">🍾</span>
        <span className="mt-1 text-xs font-semibold">Général</span>
      </button>
    </div>
  );
}

function HeadcountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="nums inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold">
      <PeopleIcon className="size-4 text-accent-ink" />
      {count}
      <span className="font-normal text-ink-muted">{label}</span>
    </span>
  );
}

function DayCard({
  meal,
  participants,
  headcount,
  onEditDinner,
  setItems,
  onToggleExclude,
}: {
  meal: Meal | undefined;
  participants: Participant[];
  headcount: number;
  onEditDinner: () => void;
  setItems: (items: ShoppingItem[]) => void;
  onToggleExclude: (v: boolean) => void;
}) {
  if (!meal) return null;
  const chefs = meal.chefs
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean) as Participant[];
  const hasDinner = chefs.length > 0 || meal.description.trim().length > 0;

  return (
    <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold capitalize">
          {fmtLong.format(new Date(meal.date + "T00:00:00"))}
        </h2>
        <HeadcountBadge count={headcount} label="à table" />
      </div>

      {/* Dinner */}
      <div className="rounded-[var(--radius-md)] bg-surface-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink-muted">Au dîner</h3>
          <Button variant="ghost" onClick={onEditDinner} className="h-8 min-h-0 px-2.5 text-xs">
            <EditIcon /> {hasDinner ? "Modifier" : "Planifier"}
          </Button>
        </div>
        {hasDinner ? (
          <div className="mt-2 flex flex-col gap-2">
            {meal.description && <p className="font-medium leading-snug">{meal.description}</p>}
            {chefs.length > 0 ? (
              <div className="flex items-center gap-2">
                <AvatarStack people={chefs} size={26} />
                <span className="text-sm text-ink-muted">
                  {chefs.map((c) => c.name).join(", ")} {chefs.length > 1 ? "cuisinent" : "cuisine"}
                </span>
              </div>
            ) : (
              <p className="text-sm text-accent-ink">Personne n’est encore aux fourneaux.</p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
            Aucun dîner prévu. Réclame ce soir et choisis le menu.
          </p>
        )}
      </div>

      <ShoppingList
        items={meal.shoppingList}
        setItems={setItems}
        category="dinner"
        headcount={headcount}
        description={meal.description}
        exclude={{ value: meal.excludeFromShopping, onChange: onToggleExclude }}
      />
    </section>
  );
}

function GeneralCard({
  meal,
  setItems,
  headcount,
}: {
  meal: Meal | undefined;
  setItems: (items: ShoppingItem[]) => void;
  headcount: number;
}) {
  if (!meal) return null;
  return (
    <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Général</h2>
          <p className="text-sm text-ink-muted">Apéro, lunchs sur les pistes &amp; petits-déjeuners.</p>
        </div>
        <HeadcountBadge count={headcount} label="pers.-jours" />
      </div>

      <ShoppingList items={meal.shoppingList} setItems={setItems} category="general" headcount={headcount} />
    </section>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}
