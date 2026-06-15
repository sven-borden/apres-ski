# Design system

Full visual system: [DESIGN.md](../DESIGN.md). Strategy / brand / register:
[PRODUCT.md](../PRODUCT.md). This is the working summary.

## Register

**Product** — design serves the task. Warm "après-ski cheer" personality:
cheerful, capable, cozy; grown-up, not cutesy. Glance-first (used with gloves,
in snow glare and dim chalets).

## Tokens (`src/app/globals.css`)

OKLCH throughout, role-named, swapped by `prefers-color-scheme`:

- **Light** = alpine-bright (cool ice-tinted off-white, deep-navy ink).
- **Dark** = chalet-evening (deep midnight navy, warm off-white ink).
- Accent = après **orange** (the logo's clinking glasses) — primary actions,
  "you", active nav only. `--cold` ice-blue for snow/weather; `--present` green,
  `--warn`, `--danger` semantics.
- Radii `--radius-sm/md/lg`, motion `--ease-out` + `--t-fast/base/slow`,
  semantic z-index scale (`--z-nav … --z-toast`).

Use the Tailwind v4 utilities these generate (`bg-surface`, `text-ink`,
`text-accent-ink`, `border-border`, …) — defined via `@theme inline`.

## Typography

- **Display**: `Bricolage Grotesque` (variable, Google) — hero countdown, titles.
- **UI/body**: native system sans (fast, PWA-native, not Inter).
- Tabular figures (`.nums`) on countdowns, headcounts, quantities.

## Conventions

- Body text ≥ 4.5:1 contrast (both themes); orange never carries body text —
  use `--accent-ink`.
- Cards aren't the default; vary block structure. No SaaS eyebrows, no gradient
  text, no decorative glass.
- Every animation has a `prefers-reduced-motion` fallback (handled globally in
  `globals.css`).
- Shared primitives: `Button`, `Modal`, `ConfirmDialog`, `Avatar`/`AvatarStack`,
  `Field`/`Input`/`Textarea`, `Toast`, `CopyButton`.
- FR copy by default (French is the primary locale).

For deeper work, the `/impeccable` skill (`.claude/skills/impeccable`) reads
PRODUCT.md + DESIGN.md before designing.
