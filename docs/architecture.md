# Architecture & Developer Guide

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Backend | Firebase / Firestore (client-side only, no `firebase-admin`) |
| AI | `@anthropic-ai/sdk` (shopping quantity estimation, item grouping) |
| Visual Effects | `react-snowfall` (animated snowfall overlay) |
| Language | TypeScript 5 (strict) |
| Font | Inter (via `next/font/google`) |
| Icons | Inline SVGs (no icon library) |

## Data Flow

```
Firestore  ←──onSnapshot──→  lib/hooks/use*.ts  ──→  Components
                              lib/actions/*.ts   ←──  Components
```

All data flows through two layers:

1. **Hooks** read data in real-time via Firestore `onSnapshot` listeners
2. **Actions** write data via `setDoc` with merge semantics

Components never interact with Firestore directly.

## Hooks Pattern

All hooks live in `lib/hooks/` and follow the same shape:

```ts
export function useExample() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(ref, (snap) => {
      setData(/* transform snapshot */);
      setLoading(false);
    }, (err) => setError(err));
    return unsub;
  }, []);

  return { data, loading, error };
}
```

Key details:
- `onSnapshot` establishes a real-time listener that updates on any remote change
- The `useEffect` cleanup returns the unsubscribe function
- All hooks return `{ data, loading, error }`

Available hooks: `useTrip`, `useParticipants`, `useAttendance`, `useMeals`, `useBasecamp`, `useWeather`, `useOnline`, `useConsolidatedShopping`

## Actions Pattern

All actions live in `lib/actions/` and follow the same shape:

```ts
export async function updateSomething(fields: Partial<T>, updatedBy: string) {
  const ref = doc(db, "collection", "docId");
  await setDoc(ref, {
    ...fields,
    updatedAt: serverTimestamp(),
    updatedBy,
  }, { merge: true });
}
```

Key details:
- `setDoc` with `{ merge: true }` for partial updates (upsert semantics)
- `serverTimestamp()` auto-injected for `updatedAt`
- `updatedBy` tracks which participant made the change

Available actions by file:

**`basecamp.ts`**: `updateBasecamp`

**`trip.ts`**: `saveTrip`

**`attendance.ts`**: `toggleAttendance`

**`meals.ts`**: `seedMeals`, `ensureGeneralMeal`, `updateDinner`, `addShoppingItem`, `toggleShoppingItem`, `updateShoppingQuantities`, `resetShoppingQuantities`, `updateSingleItemQuantity`, `updateShoppingItemText`, `removeShoppingItem`, `toggleExcludeFromShopping`

**`weather.ts`**: `refreshWeather`

## Firebase Setup

The Firebase singleton lives in `lib/firebase.ts`:

- **Browser-only guard:** Throws if initialized server-side
- **Environment validation:** Checks all `NEXT_PUBLIC_FIREBASE_*` vars are present
- **Singleton:** Uses `getApps().length === 0` check before `initializeApp()`
- **Offline persistence:** `initializeFirestore()` with `persistentLocalCache()` — must use `initializeFirestore()` (not `getFirestore()`) to pass cache settings
- Exports: `getFirebaseInstance()`, `getDb()`, `initAnalytics()`, `getAnalyticsInstance()`

## User Identity

There is no authentication. Users self-identify on first visit:

1. `UserProvider` (React context) reads `localStorage('apres-ski-user')` using `useSyncExternalStore`
2. If no user exists, `UserSetupModal` renders — prompts for name and color selection
3. `saveUser()` writes to both localStorage and a Firestore `participants` document
4. Subsequent visits read the stored identity from localStorage

The `LocalUser` type (`lib/types.ts`) stores: `id`, `name`, `color`, `avatar`, `createdAt`.

## Routing & Layout

Five routes, all client components:

| Route | View | Description |
|-------|------|-------------|
| `/` | Hub | Dashboard with countdown, weather, today's snapshot |
| `/feasts` | Feasts | Meal planning with date scroller and per-day shopping |
| `/shopping` | Shopping | Consolidated shopping list across all days (AI-powered) |
| `/crew` | Crew | Participant management + attendance timeline |
| `/basecamp` | Basecamp | Chalet info, address, WiFi, contacts |

### Layout Structure

```
<RootLayout>                    // app/layout.tsx — Inter font, lang="fr"
  <Script />                    // Microsoft Clarity (optional)
  <LocaleProvider>              // lib/i18n/LocaleProvider.tsx
    <UserProvider>              // components/providers/UserProvider.tsx
      <AppShell>                // Responsive navigation wrapper
        <DesktopHeader />       // Top nav bar (visible md+)
        <OfflineBanner />       // Orange bar when offline
        <MountainBackdrop />    // SVG mountain background
        <SnowOverlay />         // Animated snowfall (react-snowfall)
        {children}              // Page content
        <MobileTabBar />        // Fixed bottom tabs (visible <md)
      </AppShell>
    </UserProvider>
  </LocaleProvider>
</RootLayout>
```

Each page follows the pattern: loading skeleton → empty state → data view.

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/estimate-quantities` | POST | AI-powered shopping quantity estimation per headcount |
| `/api/group-shopping-items` | POST | AI-powered duplicate item grouping across days |

### Middleware

`middleware.ts` geo-blocks `/api/*` routes to CH, FR, DE, AT, IT, LI (local dev requests without `x-vercel-ip-country` are allowed).

## i18n

Bilingual support via `LocaleProvider`:

- `lib/i18n/LocaleProvider.tsx` — context provider with `useLocale()` hook
- `lib/i18n/locales/fr.ts` — French translations (default, defines `Translations` interface)
- `lib/i18n/locales/en.ts` — English translations
- `lib/i18n/locales/index.ts` — re-exports, `defaultLocale`, `dictionaries`
- `components/ui/LanguageToggle.tsx` — FR/EN toggle button
- Locale persisted in localStorage key `apres-ski-locale`

## Analytics

- `lib/analytics.ts` — typed helper functions wrapping Firebase `logEvent`
- `components/layout/PageViewTracker.tsx` — tracks page views on route changes
- Microsoft Clarity — loaded via `<Script>` in root layout (optional, controlled by `NEXT_PUBLIC_MS_CLARITY_PROJECT_ID`)

## Project Structure

```
app/                            Pages, API routes, global styles
  layout.tsx                    Root layout (Inter font, LocaleProvider, UserProvider)
  page.tsx                      Hub dashboard
  globals.css                   Tailwind v4 + design tokens
  icon.png                      PNG favicon
  apple-icon.png                Apple touch icon
  manifest.ts                   PWA manifest
  feasts/page.tsx               Meal planning
  shopping/page.tsx             Consolidated shopping list
  crew/page.tsx                 Participant management + attendance
  basecamp/page.tsx             Chalet info
  api/
    estimate-quantities/route.ts  AI quantity estimation endpoint
    group-shopping-items/route.ts AI item grouping endpoint
lib/                            Shared logic
  firebase.ts                   Firebase/Firestore singleton
  types.ts                      All TypeScript interfaces
  analytics.ts                  Firebase Analytics event helpers
  hooks/                        Real-time data hooks (onSnapshot)
    useTrip.ts, useParticipants.ts, useAttendance.ts, useMeals.ts,
    useBasecamp.ts, useWeather.ts, useOnline.ts, useConsolidatedShopping.ts
  actions/                      Firestore write functions
    basecamp.ts, trip.ts, attendance.ts, meals.ts, weather.ts
  utils/                        Helpers
    cn.ts, colors.ts, dates.ts, countdown.ts, weather.ts,
    styles.ts, typeGuards.ts, units.ts
  i18n/                         Internationalization
    LocaleProvider.tsx           Context provider + useLocale hook
    locales/
      index.ts, en.ts, fr.ts    Translation dictionaries
components/
  providers/                    UserProvider (context + localStorage)
  layout/                       AppShell, DesktopHeader, MobileTabBar, OfflineBanner,
                                MountainBackdrop, SnowOverlay, PageViewTracker
  ui/                           Card, Button, Modal, Avatar, CopyButton, StatusBadge,
                                RevealField, DietaryTag, ConfirmDialog, LanguageToggle,
                                SectionHeader
  hub/                          LiteHero, SpotlightCard, WeatherWidget, ChaletSnippet,
                                CrewStrip, MealNudge
  feasts/                       DateScroller, DayMealCard, DinnerSection,
                                EditDinnerModal, ParticipantPicker, ShoppingList,
                                GeneralCard
  lineup/                       TimelineMatrix, TimelineRow, TimelineCell
  crew/                         AddCrewModal, EditCrewModal
  basecamp/                     MapEmbed, AddressBlock, EssentialsGrid,
                                EditBasecampModal, EditTripModal
  UserSetupModal.tsx            First-visit user setup
middleware.ts                   Geo-blocking for API routes
docs/                           Project documentation
public/                         Static assets (icons)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

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
| `ANTHROPIC_API_KEY` | Server | Anthropic API key for AI-powered features |
