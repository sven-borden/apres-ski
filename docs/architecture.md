# Architecture & Developer Guide

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Backend | Firebase / Firestore (client-side only, no `firebase-admin`) |
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

Available hooks: `useTrip`, `useParticipants`, `useAttendance`, `useMeals`, `useBasecamp`

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

Available actions: `updateBasecamp`, `toggleAttendance`, `claimApero`, `claimDinner`, `updateMealDetails`, `unclaimMeal`, `seedMeals`

## Firebase Setup

The Firebase singleton lives in `lib/firebase.ts`:

- **Browser-only guard:** Throws if initialized server-side
- **Environment validation:** Checks all `NEXT_PUBLIC_FIREBASE_*` vars are present
- **Singleton:** Uses `getApps().length === 0` check before `initializeApp()`
- **Offline persistence:** `initializeFirestore()` with `persistentLocalCache()` — must use `initializeFirestore()` (not `getFirestore()`) to pass cache settings
- Exports: `app`, `db` (both `undefined` during SSR)

## User Identity

There is no authentication. Users self-identify on first visit:

1. `UserProvider` (React context) reads `localStorage('apres-ski-user')` using `useSyncExternalStore`
2. If no user exists, `UserSetupModal` renders — prompts for name and color selection
3. `saveUser()` writes to both localStorage and a Firestore `participants` document
4. Subsequent visits read the stored identity from localStorage

The `LocalUser` type (`lib/types.ts`) stores: `id`, `name`, `color`, `avatar`, `createdAt`.

## Routing & Layout

Four routes, all client components:

| Route | View | Description |
|-------|------|-------------|
| `/` | Hub | Dashboard with countdown, today's snapshot, quick actions |
| `/lineup` | Lineup | Attendance timeline matrix |
| `/feasts` | Feasts | Meal planning with date scroller |
| `/basecamp` | Basecamp | Chalet info, address, WiFi, contacts |

### Layout Structure

```
<RootLayout>                    // app/layout.tsx — Inter font, UserProvider
  <AppShell>                    // Responsive navigation wrapper
    <DesktopHeader />           // Top nav bar (visible md+)
    <OfflineBanner />           // Orange bar when offline
    {children}                  // Page content
    <MobileTabBar />            // Fixed bottom tabs (visible <md)
  </AppShell>
</RootLayout>
```

Each page follows the pattern: loading skeleton → empty state → data view.

## Project Structure

```
app/                    Pages and global styles
  layout.tsx            Root layout (Inter font, UserProvider)
  page.tsx              Hub dashboard
  globals.css           Tailwind v4 + design tokens
  icon.svg              SVG favicon
  manifest.ts           PWA manifest
  lineup/page.tsx       Attendance timeline
  feasts/page.tsx       Meal planning
  basecamp/page.tsx     Chalet info
lib/                    Shared logic
  firebase.ts           Firebase/Firestore singleton
  types.ts              All TypeScript interfaces
  hooks/                Real-time data hooks (onSnapshot)
  actions/              Firestore write functions
  utils/                Helpers (dates, colors, countdown, cn)
components/
  providers/            UserProvider (context + localStorage)
  layout/               AppShell, DesktopHeader, MobileTabBar, OfflineBanner
  ui/                   Card, Button, Modal, Avatar, CopyButton, StatusBadge, RevealField, DietaryTag
  hub/                  HeroHeader, TodaySnapshot, QuickActions
  lineup/               TimelineMatrix, TimelineRow, TimelineCell, EditTripModal
  feasts/               DateScroller, DayMealCard, AperoSection, DinnerSection, ClaimModal
  basecamp/             MapEmbed, AddressBlock, EssentialsGrid, EditBasecampModal
  UserSetupModal.tsx    First-visit user setup
docs/                   Project documentation
public/                 Static assets (icons, hero image)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase project values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

All prefixed with `NEXT_PUBLIC_` so they are available client-side.
