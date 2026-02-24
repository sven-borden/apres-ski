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

Apres-ski is a shared ski trip organizer — a mobile-first PWA for managing chalet info, attendance, meal planning, and shopping lists. It uses a trust-based, no-auth model where users self-identify via localStorage and share the app via link.

### Tech Stack

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 + Firebase 12 (client-only, no firebase-admin) + `@anthropic-ai/sdk` (AI features) + `react-snowfall` (visual effects).

### Data Flow

```
Firestore ←→ lib/hooks/use*.ts (onSnapshot listeners) → Components
                lib/actions/*.ts (setDoc with merge) ← Components
```

**Hooks** (`lib/hooks/`): Real-time listeners using `onSnapshot` in `useEffect`. All return `{ data, loading, error }`.

**Actions** (`lib/actions/`): Async write functions using `setDoc({ merge: true })`. Auto-inject `serverTimestamp()` for `updatedAt` and accept `updatedBy`.

### Firebase

- Singleton in `lib/firebase.ts` — browser-only guard, uses `initializeFirestore()` (not `getFirestore()`) to enable `persistentLocalCache()` for offline support. Exports `getFirebaseInstance()`, `getDb()`, `initAnalytics()`, `getAnalyticsInstance()`.
- Single-trip model: doc ID `"current"` for trip and basecamp.
- Composite doc IDs: attendance uses `{participantId}_{YYYY-MM-DD}`, meals use `YYYY-MM-DD` (plus `"general"` for trip-wide items).
- Firestore rules enforce field validation, type checking, and bounded lengths (not open read/write).

### Routing

Five main routes: `/` (hub dashboard), `/feasts` (meals & per-day shopping), `/shopping` (consolidated shopping list), `/crew` (participant management + attendance timeline), `/basecamp` (chalet info). All page components are client components with loading skeleton → empty state → data view pattern.

### API Routes

Two server-side API routes powered by Anthropic AI:

- `POST /api/estimate-quantities` — Uses `claude-sonnet-4-6` to estimate shopping quantities per headcount. Supports `dinner` and `general` categories. Rate-limited (12s between requests, 50/day per IP). Bearer token auth via `NEXT_PUBLIC_ESTIMATE_API_TOKEN`.
- `POST /api/group-shopping-items` — Uses `claude-haiku-4-5-20251001` to group duplicate/similar shopping items across days into canonical names. Same rate-limiting and auth.

### i18n

Bilingual support (French/English) via `LocaleProvider` in `lib/i18n/`. Translations live in `lib/i18n/locales/{en,fr}.ts`. `useLocale()` hook provides `{ locale, t, setLocale }`. `LanguageToggle` component in `components/ui/`. Root layout uses `lang="fr"` (French default). Locale persisted in localStorage key `apres-ski-locale`.

### Analytics

`lib/analytics.ts` wraps Firebase Analytics `logEvent` with typed helper functions (e.g., `trackDinnerSaved`, `trackShoppingItemAdded`). Microsoft Clarity integration is optional, loaded via `<Script>` tag in root layout when `NEXT_PUBLIC_MS_CLARITY_PROJECT_ID` is set. `PageViewTracker` component in `components/layout/`.

### Layout

`AppShell` provides responsive navigation: `DesktopHeader` (top nav, md+), `OfflineBanner` (orange bar when offline), and `MobileTabBar` (fixed bottom tabs, <md). Content area uses `pb-20 md:pb-0` for mobile tab clearance. `MountainBackdrop` renders an SVG mountain background. `SnowOverlay` adds animated snowfall via `react-snowfall`.

### Weather

Weather data for La Tzoumaz is fetched from the [Open-Meteo API](https://open-meteo.com/) (free, no API key). Data is cached in Firestore at `weather/la-tzoumaz` with a 1-hour TTL. `useWeather` hook listens via `onSnapshot` and triggers `refreshWeather()` action when stale. Utility functions in `lib/utils/weather.ts` map WMO codes to emoji/labels and provide snow vibe text.

### User Identity

`UserProvider` uses `useSyncExternalStore` to read from localStorage key `apres-ski-user`. On first visit, `UserSetupModal` prompts for name/color. `saveUser()` writes to both localStorage and Firestore participants collection.

### Middleware

`middleware.ts` geo-blocks API routes to Switzerland and bordering countries (CH, FR, DE, AT, IT, LI). Requests without `x-vercel-ip-country` header (local dev) are allowed through. Only applies to `/api/*` routes.

### Security

`next.config.ts` sets security headers on all routes: Content-Security-Policy (with per-environment `script-src`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (disabling geolocation, microphone, camera). `poweredByHeader` is disabled.

### Meal & Shopping Model

Meals use a flat schema: `responsibleIds` (string array of cook IDs), `description` (free text), `shoppingList` (array of `ShoppingItem`), `excludeFromShopping` (boolean to toggle per-day exclusion from consolidated list). The `"general"` doc ID stores trip-wide shopping items not tied to a specific date. Old apero/dinner sub-schemas are removed.

`useConsolidatedShopping` hook aggregates shopping lists across all meal days. AI-powered grouping and quantity estimation available via API routes.

## Conventions

### Tailwind v4

Uses `@import "tailwindcss"` in `globals.css` with CSS custom properties mapped via `@theme inline`. Design tokens: `text-midnight` (primary text), `bg-alpine`/`text-alpine` (primary actions), `bg-spritz`/`text-spritz` (accent), `text-mist` (secondary text), `bg-pine`/`text-pine` (success), `bg-danger`/`text-danger` (destructive), `bg-caution`/`text-caution` (warnings). Glassmorphism surface tokens: `bg-glass` (semi-transparent white, 70% opacity) for cards/modals/nav, `border-glass-border` (subtle white border). Body uses a fixed mountain-sky gradient; `AppShell` adds a gradient overlay div. Use `backdrop-blur-md` on glass surfaces. Form inputs use `bg-white/50` instead of the old `bg-powder`.

### Path Alias

`@/*` maps to project root (e.g., `@/lib/types`, `@/components/ui/Button`).

### Types

All interfaces defined in `lib/types.ts`. Uses Firestore `Timestamp` type.

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Client | Firebase Analytics measurement ID |
| `NEXT_PUBLIC_MS_CLARITY_PROJECT_ID` | Client | Microsoft Clarity project ID (optional) |
| `NEXT_PUBLIC_ESTIMATE_API_TOKEN` | Client | Bearer token for AI estimate API routes |
| `ANTHROPIC_API_KEY` | Server | Anthropic API key for AI features |

## Gotchas

- `PARTICIPANT_COLORS` uses `as const` — use explicit `useState<string>()` to avoid type narrowing issues.
- Card component requires children — cannot use self-closing `<Card />`.
- Use `useSyncExternalStore` for localStorage reads (not `useState` + `useEffect`) to avoid React 19 hydration issues.
- Use `initializeFirestore()` with settings object, not `getFirestore()` with 3 args.
- PostCSS config: `{ plugins: { "@tailwindcss/postcss": {} } }`.
- Meals `"general"` doc ID doesn't match `YYYY-MM-DD` pattern required by Firestore rules — writes to this doc may fall through to implicit deny.

### Offline & PWA

- `useOnline` hook (`lib/hooks/useOnline.ts`) uses `useSyncExternalStore` to track connectivity.
- `OfflineBanner` shows when offline; Firestore `persistentLocalCache()` handles data sync.
- PWA manifest at `app/manifest.ts` (served as `/manifest.webmanifest`), PNG favicon at `app/icon.png`, Apple touch icon at `app/apple-icon.png`, PNG icons in `public/icons/`.

### Meal Seeding

`seedMeals(startDate, endDate)` in `lib/actions/meals.ts` auto-creates unassigned meal docs for each trip date plus a `"general"` doc (skips existing). Called from `EditTripModal` after saving a trip.

## Git Workflow

Use GitHub (`gh` CLI) as much as possible for all Git operations:

- **Branches**: Create feature branches (`feat/...`), fix branches (`fix/...`) for all changes — never commit directly to `main`.
- **Pull Requests**: Always use `gh pr create` to open PRs against `main`. Include a summary and test plan.
- **Merging**: Use `gh pr merge --squash --auto` to merge PRs — squash merge with auto-merge enabled by default.
- **Issues**: Use `gh issue create` / `gh issue list` to track work.
- **Reviews**: Use `gh pr view`, `gh pr checks` to verify CI status before merging.

## Project Status

All phases complete (1-7). Post-phase additions: consolidated shopping lists with AI-powered quantity estimation and item grouping, i18n (French/English), Firebase Analytics + Microsoft Clarity, geo-blocking middleware, CSP security headers, visual effects (snow overlay, mountain backdrop), and glassmorphism design system.
