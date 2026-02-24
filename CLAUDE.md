# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (flat config, no args needed)
```

No test runner is configured.

## Architecture

Apres-ski is a shared ski trip organizer — a mobile-first PWA for managing chalet info, attendance, and meal planning. It uses a trust-based, no-auth model where users self-identify via localStorage and share the app via link.

### Tech Stack

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 + Firebase 12 (client-only, no firebase-admin).

### Data Flow

```
Firestore ←→ lib/hooks/use*.ts (onSnapshot listeners) → Components
                lib/actions/*.ts (setDoc with merge) ← Components
```

**Hooks** (`lib/hooks/`): Real-time listeners using `onSnapshot` in `useEffect`. All return `{ data, loading, error }`.

**Actions** (`lib/actions/`): Async write functions using `setDoc({ merge: true })`. Auto-inject `serverTimestamp()` for `updatedAt` and accept `updatedBy`.

### Firebase

- Singleton in `lib/firebase.ts` — browser-only guard, uses `initializeFirestore()` (not `getFirestore()`) to enable `persistentLocalCache()` for offline support.
- Single-trip model: doc ID `"current"` for trip and basecamp.
- Composite doc IDs: attendance uses `{participantId}_{YYYY-MM-DD}`, meals use `YYYY-MM-DD`.
- Firestore rules are open read/write (no auth).

### Weather

Weather data for La Tzoumaz is fetched from the [Open-Meteo API](https://open-meteo.com/) (free, no API key). Data is cached in Firestore at `weather/la-tzoumaz` with a 1-hour TTL. `useWeather` hook listens via `onSnapshot` and triggers `refreshWeather()` action when stale. Utility functions in `lib/utils/weather.ts` map WMO codes to emoji/labels and provide snow vibe text.

### User Identity

`UserProvider` uses `useSyncExternalStore` to read from localStorage key `apres-ski-user`. On first visit, `UserSetupModal` prompts for name/color. `saveUser()` writes to both localStorage and Firestore participants collection.

### Routing

Five main routes: `/` (hub dashboard), `/lineup` (attendance timeline), `/feasts` (meals), `/crew` (participant management), `/basecamp` (chalet info). All page components are client components with loading skeleton → empty state → data view pattern.

### Layout

`AppShell` provides responsive navigation: `DesktopHeader` (top nav, md+), `OfflineBanner` (orange bar when offline), and `MobileTabBar` (fixed bottom tabs, <md). Content area uses `pb-20 md:pb-0` for mobile tab clearance.

## Conventions

### Tailwind v4

Uses `@import "tailwindcss"` in `globals.css` with CSS custom properties mapped via `@theme inline`. Design tokens: `text-midnight` (primary text), `bg-alpine`/`text-alpine` (primary actions), `bg-spritz`/`text-spritz` (accent), `text-mist` (secondary text), `bg-pine`/`text-pine` (success). Glassmorphism surface tokens: `bg-glass` (semi-transparent white, 70% opacity) for cards/modals/nav, `border-glass-border` (subtle white border). Body uses a fixed mountain-sky gradient; `AppShell` adds a gradient overlay div. Use `backdrop-blur-md` on glass surfaces. Form inputs use `bg-white/50` instead of the old `bg-powder`.

### Path Alias

`@/*` maps to project root (e.g., `@/lib/types`, `@/components/ui/Button`).

### Types

All interfaces defined in `lib/types.ts`. Uses Firestore `Timestamp` type.

## Gotchas

- `PARTICIPANT_COLORS` uses `as const` — use explicit `useState<string>()` to avoid type narrowing issues.
- Card component requires children — cannot use self-closing `<Card />`.
- Use `useSyncExternalStore` for localStorage reads (not `useState` + `useEffect`) to avoid React 19 hydration issues.
- Use `initializeFirestore()` with settings object, not `getFirestore()` with 3 args.
- PostCSS config: `{ plugins: { "@tailwindcss/postcss": {} } }`.

### Offline & PWA

- `useOnline` hook (`lib/hooks/useOnline.ts`) uses `useSyncExternalStore` to track connectivity.
- `OfflineBanner` shows when offline; Firestore `persistentLocalCache()` handles data sync.
- PWA manifest at `app/manifest.ts` (served as `/manifest.webmanifest`), PNG favicon at `app/icon.png`, Apple touch icon at `app/apple-icon.png`, PNG icons in `public/icons/`.

### Meal Seeding

`seedMeals(startDate, endDate)` in `lib/actions/meals.ts` auto-creates unassigned meal docs for each trip date (skips existing). Called from `EditTripModal` after saving a trip.

## Git Workflow

Use GitHub (`gh` CLI) as much as possible for all Git operations:

- **Branches**: Create feature branches (`feat/...`), fix branches (`fix/...`) for all changes — never commit directly to `master`.
- **Pull Requests**: Always use `gh pr create` to open PRs against `master`. Include a summary and test plan.
- **Merging**: Use `gh pr merge` to merge PRs — prefer squash merges to keep history clean.
- **Issues**: Use `gh issue create` / `gh issue list` to track work.
- **Reviews**: Use `gh pr view`, `gh pr checks` to verify CI status before merging.

## Project Status

All phases complete (1-7).
