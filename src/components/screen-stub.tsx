export function ScreenStub({
  title,
  blurb,
  next,
}: {
  title: string;
  blurb: string;
  next: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="max-w-prose text-ink-muted">{blurb}</p>
      </header>
      <div className="flex flex-col items-start gap-3 rounded-[var(--radius-md)] border border-dashed border-border bg-surface px-6 py-8">
        <span className="rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-ink">
          En chantier
        </span>
        <p className="max-w-prose text-sm text-ink-muted">{next}</p>
      </div>
    </div>
  );
}
