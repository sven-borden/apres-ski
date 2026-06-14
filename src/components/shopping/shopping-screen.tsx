"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { UNITS, seedMeals, type Meal, type Unit } from "@/lib/feasts";
import {
  consolidate,
  fingerprint,
  smartMerge,
  type Line,
  type MergedGroup,
} from "@/lib/shopping";

const SINGULAR: Partial<Record<Unit, string>> = { bottles: "bouteille", packs: "paquet", pcs: "pièce" };

function itemQty(quantity?: number, unit?: Unit) {
  if (quantity == null) return null;
  const label = (quantity === 1 && unit && SINGULAR[unit]) || UNITS.find((u) => u.value === unit)?.label || "";
  return `${quantity} ${label}`.trim();
}

export function ShoppingScreen() {
  const [meals, setMeals] = useState<Record<string, Meal>>(() => seedMeals());
  const [justChecked, setJustChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showPurchased, setShowPurchased] = useState(false);
  const [merged, setMerged] = useState<MergedGroup[] | null>(null);
  const [mergeFp, setMergeFp] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const lines = useMemo(() => consolidate(meals), [meals]);
  const fp = useMemo(() => fingerprint(lines), [lines]);

  // If the item set changed since the merge, the cached grouping is stale →
  // fall back to the flat list (§6.2). Derived, so no setState-in-effect.
  const view = merged && mergeFp === fp ? merged : null;

  const total = lines.length;
  const doneCount = lines.filter((l) => l.done).length;
  const remaining = total - doneCount;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  function setLineChecked(line: Line, checked: boolean) {
    // Write back to every source, grouped by date (one update per meal). §4.3
    const ids = new Set(line.sources.map((s) => `${s.date}::${s.item.id}`));
    setMeals((prev) => {
      const next = { ...prev };
      for (const s of line.sources) {
        const meal = next[s.date];
        next[s.date] = {
          ...meal,
          shoppingList: meal.shoppingList.map((it) =>
            ids.has(`${s.date}::${it.id}`) ? { ...it, checked } : it,
          ),
        };
      }
      return next;
    });

    const t = timers.current.get(line.key);
    if (t) clearTimeout(t);
    if (checked) {
      setJustChecked((s) => new Set(s).add(line.key));
      const timer = setTimeout(() => {
        setJustChecked((s) => {
          const n = new Set(s);
          n.delete(line.key);
          return n;
        });
        timers.current.delete(line.key);
      }, 2000);
      timers.current.set(line.key, timer);
    } else {
      setJustChecked((s) => {
        const n = new Set(s);
        n.delete(line.key);
        return n;
      });
    }
  }

  async function runMerge() {
    setMerging(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate the server round-trip
    const groups = smartMerge(lines);
    setMerged(groups);
    setMergeFp(fp);
    try {
      sessionStorage.setItem("apres.shoppingMergeFp", fp);
    } catch {
      // sessionStorage unavailable — merge still works, just not remembered.
    }
    setMerging(false);
  }

  function toggleDetails(key: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }

  const active = lines.filter((l) => !l.done || justChecked.has(l.key));
  const purchased = lines.filter((l) => l.done && !justChecked.has(l.key));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Courses</h1>
        <p className="text-ink-muted">Tout ce qu’il faut acheter, regroupé pour le séjour.</p>
      </header>

      {total === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="text-ink-muted">
            Rien à acheter pour l’instant. Planifie des repas et ajoute des articles.
          </p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                  {remaining === 0 ? "Tout est acheté 🎉" : `${remaining} ${remaining === 1 ? "article restant" : "articles restants"}`}
                </p>
                <p className="nums text-sm text-ink-muted">
                  {doneCount} / {total} cochés
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={view ? () => { setMerged(null); setMergeFp(null); } : runMerge}
                disabled={merging}
                className="h-10 min-h-0 px-4 text-sm"
              >
                {merging ? <Spinner /> : view ? <ListIcon /> : <SparkIcon />}
                {merging ? "Tri…" : view ? "Liste simple" : "Trier par rayon"}
              </Button>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full rounded-full bg-present transition-[width] duration-[var(--t-slow)] ease-[var(--ease-out)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </section>

          {view ? (
            <div className="flex flex-col gap-6">
              {view.map((group) => (
                <section key={group.category.id} className="flex flex-col gap-1">
                  <h2 className="flex items-baseline gap-2 px-1 text-sm font-bold text-accent-ink">
                    {group.category.label}
                    <span className="nums text-xs font-medium text-ink-muted">{group.lines.length}</span>
                  </h2>
                  <ul className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
                    {group.lines.map((line) => (
                      <Row
                        key={line.key}
                        line={line}
                        expanded={expanded.has(line.key)}
                        onToggleCheck={setLineChecked}
                        onToggleDetails={() => toggleDetails(line.key)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <ul className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
                {active.map((line) => (
                  <Row
                    key={line.key}
                    line={line}
                    expanded={expanded.has(line.key)}
                    onToggleCheck={setLineChecked}
                    onToggleDetails={() => toggleDetails(line.key)}
                  />
                ))}
                {active.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-ink-muted">
                    Tout est dans le panier. Beau travail 🛒
                  </li>
                )}
              </ul>

              {purchased.length > 0 && (
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
                  <button
                    onClick={() => setShowPurchased((v) => !v)}
                    aria-expanded={showPurchased}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  >
                    <span>Acheté ({purchased.length})</span>
                    <ChevronIcon className={`size-4 transition-transform duration-[var(--t-fast)] ${showPurchased ? "rotate-180" : ""}`} />
                  </button>
                  {showPurchased && (
                    <ul className="border-t border-border">
                      {purchased.map((line) => (
                        <Row
                          key={line.key}
                          line={line}
                          expanded={expanded.has(line.key)}
                          onToggleCheck={setLineChecked}
                          onToggleDetails={() => toggleDetails(line.key)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p className="text-center text-xs text-ink-muted">
        Aperçu de démonstration — données fictives en attendant la connexion au backend.
      </p>
    </div>
  );
}

function Row({
  line,
  expanded,
  onToggleCheck,
  onToggleDetails,
}: {
  line: Line;
  expanded: boolean;
  onToggleCheck: (line: Line, checked: boolean) => void;
  onToggleDetails: () => void;
}) {
  const multi = line.total > 1;
  const state = line.done ? "done" : line.partial ? "partial" : "none";

  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={state === "done" ? true : state === "partial" ? "mixed" : false}
          aria-label={`${line.name}${line.done ? " — acheté" : line.partial ? " — partiellement acheté" : ""}`}
          onClick={() => onToggleCheck(line, !line.done)}
          className={`grid size-6 shrink-0 place-items-center rounded-[6px] border-2 transition-all duration-[var(--t-fast)] ease-[var(--ease-out)] active:scale-90 ${
            state === "none" ? "border-border hover:border-accent" : "border-present bg-present text-on-accent"
          }`}
        >
          {state === "done" && (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
          {state === "partial" && <span className="h-0.5 w-3 rounded-full bg-on-accent" />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-sm ${line.done ? "text-ink-muted line-through" : "text-ink"}`}>
            {line.name}
          </span>
          {multi && (
            <button
              type="button"
              onClick={onToggleDetails}
              aria-expanded={expanded}
              className="flex items-center gap-1 text-left text-xs text-ink-muted hover:text-accent-ink"
            >
              {line.total} repas
              {line.partial && <span className="text-warn">· {line.checkedCount} acheté{line.checkedCount > 1 ? "s" : ""}</span>}
              <ChevronIcon className={`size-3 transition-transform duration-[var(--t-fast)] ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {line.quantity && (
          <span className="nums shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold">
            {line.quantity}
          </span>
        )}
      </div>

      {multi && expanded && (
        <ul className="flex flex-col gap-1 bg-surface-2/60 px-4 pb-3 pl-[3.25rem]">
          {line.sources.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className={`size-1.5 rounded-full ${s.item.checked ? "bg-present" : "bg-border"}`} />
                {s.label}
              </span>
              <span className="nums text-ink-muted">{itemQty(s.item.quantity, s.item.unit) ?? "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="currentColor" />
    </svg>
  );
}
function ListIcon() {
  return <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>;
}
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
