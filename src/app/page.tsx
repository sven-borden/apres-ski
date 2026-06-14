import Link from "next/link";
import { demoTrip, daysUntil } from "@/lib/demo";
import { AvatarStack } from "@/components/avatar";

export default function Hub() {
  const trip = demoTrip();
  const until = daysUntil(trip.start);
  const fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });
  const fmtRange = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
  const unassigned = trip.days.filter((d) => d.chefs.length === 0).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Hero / countdown */}
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-8 sm:px-9 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full blur-3xl"
          style={{ background: "var(--accent-glow)" }}
        />
        <p className="text-sm font-medium text-ink-muted">Prochaine virée</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {trip.name}
        </h1>
        <p className="mt-1 text-ink-muted">
          {fmtRange.format(trip.start)} – {fmtRange.format(trip.end)}
        </p>

        <div className="mt-7 flex items-end gap-3">
          <span className="nums font-[family-name:var(--font-display)] text-[clamp(3rem,16vw,5rem)] font-extrabold leading-none text-accent-ink">
            {until}
          </span>
          <span className="mb-2 text-lg font-semibold text-ink-muted">
            {until === 1 ? "jour" : "jours"} avant de chausser les skis
          </span>
        </div>
      </section>

      {/* Meal nudge */}
      {unassigned > 0 && (
        <Link
          href="/feasts"
          className="group flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/8 px-5 py-4 transition-colors duration-[var(--t-base)] hover:bg-accent/12"
        >
          <div>
            <p className="font-semibold text-accent-ink">
              {unassigned} {unassigned === 1 ? "soir cherche" : "soirs cherchent"} encore
              un chef 🍳
            </p>
            <p className="text-sm text-ink-muted">Quelqu&apos;un pour réclamer un fourneau&nbsp;?</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-transform duration-[var(--t-fast)] group-hover:translate-x-0.5">
            Cuisiner
          </span>
        </Link>
      )}

      {/* Day carousel */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Le programme</h2>
          <span className="text-sm text-ink-muted">{trip.days.length} jours</span>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
          {trip.days.map((d, i) => {
            const date = new Date(d.date + "T00:00:00");
            return (
              <article
                key={d.date}
                className="flex min-w-[15rem] snap-start flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-base font-bold capitalize">
                    {fmtDay.format(date)}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-muted">
                    Jour {i + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <AvatarStack people={d.present} size={28} />
                  <span className="nums text-xs text-ink-muted">
                    {d.present.length}/{trip.capacity}
                  </span>
                </div>
                <div className="mt-auto rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2.5">
                  {d.meal ? (
                    <>
                      <p className="text-sm font-medium leading-snug">{d.meal}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Chef&nbsp;: {d.chefs.join(", ")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-accent-ink">
                      Soir libre — à réserver
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Weather widget */}
      <section className="flex items-center gap-5 rounded-[var(--radius-md)] border border-border bg-surface p-5">
        <span className="text-5xl" aria-hidden>
          🌨️
        </span>
        <div className="flex-1">
          <p className="font-bold">Neige fraîche aux Ruinettes</p>
          <p className="text-sm text-ink-muted">
            Poudreuse de rêve · <span className="nums">−4°C</span> · limite pluie-neige{" "}
            <span className="nums">1600 m</span>
          </p>
        </div>
        <span className="nums rounded-[var(--radius-sm)] bg-cold/12 px-3 py-2 text-center">
          <span className="block text-xl font-extrabold leading-none text-cold">112</span>
          <span className="text-[11px] font-medium text-ink-muted">cm</span>
        </span>
      </section>

      <p className="text-center text-xs text-ink-muted">
        Aperçu de démonstration — données fictives en attendant la connexion au backend.
      </p>
    </div>
  );
}
