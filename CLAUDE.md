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

### User Identity

`UserProvider` uses `useSyncExternalStore` to read from localStorage key `apres-ski-user`. On first visit, `UserSetupModal` prompts for name/color. `saveUser()` writes to both localStorage and Firestore participants collection.

### Routing

Four main routes: `/` (hub dashboard), `/rostrum` (attendance timeline), `/feasts` (meals), `/basecamp` (chalet info). All page components are client components with loading skeleton → empty state → data view pattern.

### Layout

`AppShell` provides responsive navigation: `DesktopHeader` (top nav, md+) and `MobileTabBar` (fixed bottom tabs, <md). Content area uses `pb-20 md:pb-0` for mobile tab clearance.

## Conventions

### Tailwind v4

Uses `@import "tailwindcss"` in `globals.css` with CSS custom properties mapped via `@theme inline`. Design tokens: `bg-powder` (page bg), `bg-glacier` (card surfaces), `text-midnight` (primary text), `bg-alpine`/`text-alpine` (primary actions), `bg-spritz`/`text-spritz` (accent), `text-mist` (secondary text), `bg-pine`/`text-pine` (success).

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

## Project Status

Phases 1-5 complete (scaffolding, app shell, basecamp CRUD, rostrum attendance, feasts meal planning). Phases 6-7 remain (hub dashboard, polish). See `PLAN.md` for full roadmap.
