# Design

Visual system for Apres-Ski. Derived from the existing logo (deep navy peaks,
two orange glasses clinking, an ice-blue swirl) and the strategy in
[PRODUCT.md](./PRODUCT.md): warm après-ski cheer, mobile-first PWA, light + dark
auto by system, anti-SaaS.

## Theme

Two committed themes, switched by `prefers-color-scheme` (with a manual override
allowed later). Both carry the same identity; neither is the "real" one.

- **Light — alpine-bright.** Cool ice-tinted off-white, deep navy ink, après
  orange. Built for snow-glare legibility on a chairlift. *This is the AI default
  trap to avoid: the base is cool (tinted toward the brand's blue), NOT a warm
  cream/sand/paper.*
- **Dark — chalet-evening.** Deep midnight-navy base, warm off-white ink, ember
  orange. The cozy after-dark mood; easy on eyes in a dim room, battery-kind.

Color strategy: **committed.** Navy is the structural identity (ink, dark base,
chrome); orange is the one celebratory accent (the après glasses) used with
restraint — countdown emphasis, primary actions, "today," active nav. Ice-blue is
a quiet secondary for cold/snow/weather semantics. Color is the warmth; the body
background never carries it as decorative gradient.

## Color

All values OKLCH. Tokens are role-named, not hue-named, so themes swap cleanly.

### Brand anchors (theme-independent)

| Token | OKLCH | Note |
|---|---|---|
| `--brand-navy` | `oklch(0.30 0.05 250)` | Logo peaks; structural identity |
| `--brand-orange` | `oklch(0.66 0.17 47)` | Logo glasses; celebratory accent |
| `--brand-ice` | `oklch(0.64 0.11 230)` | Logo swirl; cold/snow semantics |

### Light theme

| Role | Token | OKLCH |
|---|---|---|
| Page background | `--bg` | `oklch(0.985 0.004 240)` |
| Raised surface | `--surface` | `oklch(0.972 0.006 240)` |
| Sunken / inset | `--surface-2` | `oklch(0.945 0.009 240)` |
| Hairline / border | `--border` | `oklch(0.905 0.010 240)` |
| Primary text (ink) | `--ink` | `oklch(0.27 0.040 250)` |
| Secondary text | `--ink-muted` | `oklch(0.46 0.030 248)` |
| Accent (orange) | `--accent` | `oklch(0.62 0.17 46)` |
| Accent text-on-light | `--accent-ink` | `oklch(0.50 0.16 44)` |
| Accent foreground | `--on-accent` | `oklch(0.99 0.01 60)` |
| Ice / cold | `--cold` | `oklch(0.58 0.11 232)` |
| Success / present | `--present` | `oklch(0.58 0.10 155)` |
| Warning / over-cap | `--warn` | `oklch(0.62 0.16 60)` |
| Danger / destructive | `--danger` | `oklch(0.55 0.18 27)` |

Contrast checks (light): `--ink` on `--bg` ≈ 11:1; `--ink-muted` on `--bg`
≈ 6.3:1; `--on-accent` on `--accent` ≈ 5.2:1. Orange is **never** body text on
`--bg` — use `--accent-ink` for small accent text (≥ 4.5:1).

### Dark theme

| Role | Token | OKLCH |
|---|---|---|
| Page background | `--bg` | `oklch(0.21 0.030 256)` |
| Raised surface | `--surface` | `oklch(0.255 0.032 256)` |
| Sunken / inset | `--surface-2` | `oklch(0.30 0.034 256)` |
| Hairline / border | `--border` | `oklch(0.36 0.030 256)` |
| Primary text (ink) | `--ink` | `oklch(0.95 0.008 240)` |
| Secondary text | `--ink-muted` | `oklch(0.73 0.020 240)` |
| Accent (orange) | `--accent` | `oklch(0.70 0.16 50)` |
| Accent text-on-dark | `--accent-ink` | `oklch(0.76 0.15 52)` |
| Accent foreground | `--on-accent` | `oklch(0.20 0.04 50)` |
| Ice / cold | `--cold` | `oklch(0.72 0.10 230)` |
| Success / present | `--present` | `oklch(0.70 0.11 158)` |
| Warning / over-cap | `--warn` | `oklch(0.76 0.14 65)` |
| Danger / destructive | `--danger` | `oklch(0.66 0.17 27)` |

Contrast checks (dark): `--ink` on `--bg` ≈ 13:1; `--ink-muted` on `--bg`
≈ 6.6:1; `--accent-ink` on `--bg` ≈ 6.4:1.

### Participant palette (closed set, both themes)

Fixed avatar colors from the spec (`#rrggbb`). Chosen to be distinct for
colorblind safety and to sit on either base. Keep as the canonical 8–10:
warm-orange, ice-blue, pine-green, plum, sand-gold, raspberry, teal, slate,
brick, lilac. Each rendered as a solid avatar tint with initials in `--on-accent`
or `--ink` per its own luminance (computed, not guessed).

## Typography

Pair on a contrast axis: one characterful display + a clean neutral UI face.
Mobile-first and PWA, so the UI face is the **native system stack** (fast, zero
download, feels like part of the phone — and deliberately *not* Inter, the SaaS
tell).

- **Display / headings — `Bricolage Grotesque`** (variable, Google Fonts).
  Friendly, slightly quirky grotesque with alpine-poster character. Used for the
  hero countdown, screen titles, big numbers. Weight 600–800.
- **UI / body — system stack**: `ui-sans-serif, system-ui, -apple-system,
  "Segoe UI", Roboto, sans-serif`. Weight 400/500/600.
- **Numerals**: `font-variant-numeric: tabular-nums` on countdown, headcount,
  quantities, capacity — figures must not jitter as they change.

Rules:
- Display heading clamp max ≤ 6rem; letter-spacing floor ≥ -0.04em.
  Hero countdown: `clamp(2.5rem, 12vw, 5rem)`.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on notes/long prose.
- Body line length capped 65–75ch (mostly N/A on mobile, enforced on Basecamp
  notes at desktop width).
- Test all headings at FR length and at 320px — French copy must not overflow.

## Layout

- **Mobile-first.** Bottom tab bar (5 screens: Hub, Feasts, Shopping, Crew,
  Basecamp), thumb-reachable, with safe-area insets. ≥ 768px promotes to a top
  nav with a centered content column (max ~960px).
- **Tap targets ≥ 44px.** Generous spacing — this is touched with gloves and
  passed around.
- Spacing scale (rem): `0.25 0.5 0.75 1 1.5 2 3 4` — vary it for rhythm; the Hub
  hero breathes, list rows are tight.
- **Cards are not the default.** Use the day carousel as a horizontal scroll-snap
  strip, the attendance matrix as a real grid, shopping as flat sectioned lists.
  Reserve card framing for genuinely standalone widgets (weather, chalet
  snippet). Never nest cards.
- Radii: `--r-sm 0.5rem`, `--r-md 0.875rem`, `--r-lg 1.25rem`, `--r-full 999px`.
  Rounded and friendly, not toy-round.
- Semantic z-index scale: `--z-nav 10`, `--z-dropdown 20`, `--z-sticky 30`,
  `--z-backdrop 40`, `--z-modal 50`, `--z-toast 60`, `--z-tooltip 70`. No magic
  9999. Modals/menus use native `<dialog>` / popover to escape clipping.

## Motion

Alpine and intentional, never decorative.

- Easing: ease-out-expo / quint for entrances. No bounce, no elastic.
  `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- Durations: `--t-fast 120ms` (taps, toggles), `--t-base 220ms` (reveals),
  `--t-slow 420ms` (carousel auto-scroll, hero countdown settle).
- Signature moments, each fitted to what it reveals (no uniform reflex):
  - Countdown number settles with a short rise + fade on day change.
  - Day carousel scroll-snaps; "Today" card gets a soft orange ring glow.
  - Shopping check-off: the ~2s linger before the row sinks to "Purchased."
  - Snow-vibe / weather: a gentle drift, only when snow depth is emphasized.
  - Attendance toggle: spring-free scale + color crossfade.
- **`prefers-reduced-motion: reduce`** → all of the above become instant or a
  plain crossfade. No content gated behind a reveal transition.
- Premium materials allowed when they earn it: a soft orange glow on "Today,"
  subtle backdrop blur on the modal scrim — sparingly, never the glass-everywhere
  default.

## Components (conventions)

- **Buttons**: primary = filled `--accent` + `--on-accent`; secondary = `--ink`
  outline on `--surface`; destructive = `--danger`, always behind confirmation.
- **Avatars**: solid participant color + initials, tabular, consistent ring when
  "you."
- **Confirmation dialog**: native `<dialog>`, plain language, names the affected
  person/item ("Mark Léa as absent?"). The one deliberate friction.
- **Empty states**: warm and inviting, single clear CTA ("Set up trip"), never a
  dead end — matches the "trip is a place" principle.
- **Offline banner**: quiet, non-alarming, top inset; "Showing last-known info."
- **Toggles / matrix cells**: color + icon + label together (colorblind-safe).
