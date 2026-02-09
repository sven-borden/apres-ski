# Apres-Ski: Project Roadmap

A collaborative ski trip planner webapp. Real-time, mobile-first, no login required.

---

## Tech Stack & Key Decisions

| Category | Choice | Notes |
|----------|--------|-------|
| Framework | Next.js 16 (`next@16.0.10`) | App Router, matches Bilan-Couple/ello-owt |
| UI | React 19 (`react@^19.2.1`) | |
| Language | TypeScript 5 (strict) | `@/*` path alias, bundler resolution |
| Styling | Tailwind CSS v4 (`tailwindcss@^4`) | `@import "tailwindcss"` + `@theme inline` pattern |
| Backend | Firebase (`firebase@^12.7.0`) | Client-side only, no firebase-admin |
| Database | Firestore | Real-time listeners (`onSnapshot`), offline persistence |
| Auth | None | Shared-link model, identity via localStorage |
| State | React Context + custom hooks | No Redux/Zustand |
| Font | Inter (via `next/font/google`) | |
| Icons | Inline SVGs | No icon library |
| ESLint | v9 + `eslint-config-next@16.0.10` | `core-web-vitals` + `typescript` |

**Architectural decisions:**
- **Single trip model** -- doc ID `"current"` for trip and basecamp
- **Composite keys** for attendance: `{participantId}_{YYYY-MM-DD}` (direct upserts)
- **Date as doc ID** for meals: `{YYYY-MM-DD}`
- **Offline persistence** via `persistentLocalCache()` for mountain WiFi
- **Open Firestore rules** -- no auth, trust-based editing

---

## Patterns to Reuse

| Pattern | Source | What to Copy |
|---------|--------|--------------|
| Firebase singleton init | `ello-owt/lib/firebase.ts` | `getApps().length === 0` guard, env var validation, browser-only check |
| Tailwind v4 + @theme inline | `Bilan-Couple/website/app/[locale]/globals.css` | `:root` CSS vars -> `@theme inline` mapping |
| PostCSS config | `Bilan-Couple/website/postcss.config.mjs` | `{ plugins: { "@tailwindcss/postcss": {} } }` |
| ESLint config | `Bilan-Couple/website/eslint.config.mjs` | `defineConfig`, `globalIgnores` for `.next/**`, `out/**`, `build/**` |
| TSConfig | `Bilan-Couple/website/tsconfig.json` | Strict, `@/*` alias, ES2017 target, `react-jsx`, `next` plugin |
| Package versions | `Bilan-Couple/website/package.json` | Exact versions for next, react, tailwindcss, @tailwindcss/postcss |

---

## Design System

**Color Palette ("Modern Alpine"):**

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|-------------|----------------|-------|
| Powder White | `#F8FAFC` | `--powder-white` | `bg-powder` | Main background |
| Glacier White | `#FFFFFF` | `--glacier-white` | `bg-glacier` | Card surfaces |
| Midnight Slate | `#0F172A` | `--midnight-slate` | `text-midnight` | Primary text |
| Alpine Blue | `#2563EB` | `--alpine-blue` | `bg-alpine` / `text-alpine` | Primary action color |
| Spritz Orange | `#F97316` | `--spritz-orange` | `bg-spritz` / `text-spritz` | Accent, apero highlights |
| Pine Green | `#10B981` | `--pine-green` | `bg-pine` / `text-pine` | Status: confirmed, present |
| Mist Grey | `#94A3B8` | `--mist-grey` | `text-mist` | Secondary text, inactive |

**CSS pattern:**
```css
@import "tailwindcss";

:root {
  --powder-white: #F8FAFC;
  --glacier-white: #FFFFFF;
  --midnight-slate: #0F172A;
  --alpine-blue: #2563EB;
  --spritz-orange: #F97316;
  --pine-green: #10B981;
  --mist-grey: #94A3B8;
}

@theme inline {
  --color-powder: var(--powder-white);
  --color-glacier: var(--glacier-white);
  --color-midnight: var(--midnight-slate);
  --color-alpine: var(--alpine-blue);
  --color-spritz: var(--spritz-orange);
  --color-pine: var(--pine-green);
  --color-mist: var(--mist-grey);
}
```

**Shape tokens:**
- Cards: `rounded-2xl`, `shadow-sm`, `p-5`
- Buttons: `rounded-full` (pill-shaped)
- Mobile tab bar clearance: `pb-20 md:pb-0`

**Personality:** Crisp, Functional, Cozy, Modern. Contrast of cold outdoors / warm indoors.

---

## Firestore Data Model

### `trips` collection
- **Doc ID:** `"current"`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Trip name |
| `startDate` | string | Start date |
| `endDate` | string | End date |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `participants` collection
- **Doc ID:** auto-generated

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | |
| `name` | string | Display name |
| `color` | string | Hex color |
| `avatar` | string | Initials |
| `joinedAt` | timestamp | |
| `tripId` | string | |

### `attendance` collection
- **Doc ID:** `{participantId}_{YYYY-MM-DD}` (composite key)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | |
| `participantId` | string | |
| `participantName` | string | Denormalized |
| `participantColor` | string | Denormalized |
| `date` | string | `YYYY-MM-DD` |
| `present` | boolean | |
| `tripId` | string | |

### `meals` collection
- **Doc ID:** `{YYYY-MM-DD}` (date)

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | |
| `tripId` | string | |
| `apero` | object | `{ assignedTo, assignedParticipantId, notes, status }` |
| `dinner` | object | `{ chefName, chefParticipantId, menu, dietaryTags[], status }` |
| `updatedAt` | timestamp | |
| `updatedBy` | string | |

### `basecamp` collection
- **Doc ID:** `"current"`

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | |
| `coordinates` | object | `{ lat: number, lng: number }` |
| `mapsUrl` | string | |
| `wifi` | object | `{ network: string, password: string }` |
| `checkIn` | string | |
| `checkOut` | string | |
| `accessCodes` | array | `[{ label, code }]` |
| `emergencyContacts` | array | `[{ name, phone, role }]` |
| `notes` | string | |
| `updatedAt` | timestamp | |
| `updatedBy` | string | |

### LocalUser (localStorage only)

| Field | Type |
|-------|------|
| `id` | string |
| `name` | string |
| `color` | string |
| `avatar` | string |
| `createdAt` | timestamp |

**Key:** `localStorage('apres-ski-user')`

---

## File Structure

```
apres-ski/
├── app/
│   ├── globals.css                        # Tailwind v4 + alpine design tokens
│   ├── layout.tsx                         # Root layout: Inter font, UserProvider
│   ├── page.tsx                           # Hub Dashboard (VIEW 1)
│   ├── rostrum/page.tsx                   # Attendance timeline (VIEW 2)
│   ├── feasts/page.tsx                    # Meals & Apero (VIEW 3)
│   └── basecamp/page.tsx                  # Chalet info (VIEW 4)
├── components/
│   ├── providers/UserProvider.tsx         # React context for user identity
│   ├── layout/
│   │   ├── AppShell.tsx                   # Responsive shell
│   │   ├── MobileTabBar.tsx              # Bottom tabs (<md)
│   │   └── DesktopHeader.tsx             # Top nav (md+)
│   ├── ui/
│   │   ├── Card.tsx                       # bg-glacier rounded-2xl shadow-sm p-5
│   │   ├── Button.tsx                     # Primary/secondary, pill-shaped
│   │   ├── Modal.tsx                      # Bottom sheet (mobile) / centered (desktop)
│   │   ├── Avatar.tsx                     # Colored circle with initials
│   │   ├── CopyButton.tsx                # Click-to-copy with "Copied!" feedback
│   │   ├── StatusBadge.tsx               # Unassigned/claimed/confirmed
│   │   ├── RevealField.tsx               # Click-to-reveal sensitive info
│   │   └── DietaryTag.tsx                # Small pill chips
│   ├── hub/
│   │   ├── HeroHeader.tsx                # Mountain image + countdown overlay
│   │   ├── TodaySnapshot.tsx             # Arrivals, departures, chef, apero
│   │   └── QuickActions.tsx              # Navigate to chalet, view WiFi
│   ├── rostrum/
│   │   ├── TimelineMatrix.tsx            # Scrollable grid container
│   │   ├── TimelineRow.tsx               # Single participant row
│   │   └── TimelineCell.tsx              # Day cell (tap to toggle)
│   ├── feasts/
│   │   ├── DateScroller.tsx              # Horizontal date pills
│   │   ├── DayMealCard.tsx               # Selected day's meal card
│   │   ├── AperoSection.tsx              # Spritz-orange accent, claim/edit
│   │   ├── DinnerSection.tsx             # Chef info, menu, dietary tags
│   │   └── ClaimModal.tsx                # Claim duty modal
│   ├── basecamp/
│   │   ├── MapEmbed.tsx                  # Google Maps iframe
│   │   ├── AddressBlock.tsx              # Address + copy
│   │   ├── EssentialsGrid.tsx            # 2-col grid: WiFi, codes, contacts
│   │   └── EditBasecampModal.tsx         # Full edit form
│   └── UserSetupModal.tsx                # Name, color picker, avatar, "Join Trip"
├── lib/
│   ├── firebase.ts                        # Firebase + Firestore init (singleton)
│   ├── types.ts                           # All TypeScript interfaces
│   ├── hooks/
│   │   ├── useTrip.ts
│   │   ├── useParticipants.ts
│   │   ├── useAttendance.ts
│   │   ├── useMeals.ts
│   │   ├── useBasecamp.ts
│   │   └── useCurrentUser.ts
│   ├── actions/
│   │   ├── attendance.ts                  # toggleAttendance
│   │   ├── meals.ts                       # claimApero, claimDinner, updateMealDetails, unclaimMeal
│   │   ├── basecamp.ts                   # updateBasecamp
│   │   └── participants.ts               # createParticipant
│   └── utils/
│       ├── dates.ts                       # getDateRange, formatDateShort, isToday
│       ├── colors.ts                      # 10 predefined participant colors
│       └── countdown.ts                   # getCountdownText
├── public/
│   └── images/hero-mountain.webp
├── firestore.rules
├── firestore.indexes.json
├── .env.local / .env.example
└── CLAUDE.md
```

---

## Implementation Phases

### Phase 1: Project Scaffolding & Firebase Infrastructure

**Objective:** Working Next.js app with Firebase connected and design tokens in place.

**Dependencies:** None (starting point).

- [x] **1.1** Initialize Next.js 16 project
  - `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no`
  - Match versions from Bilan-Couple: `next@16.0.10`, `react@^19.2.1`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`
  - Add `firebase@^12.7.0`
- [x] **1.2** Config files (replicate from Bilan-Couple)
  - `tsconfig.json` -- strict mode, `@/*` path alias, bundler module resolution, ES2017 target
  - `postcss.config.mjs` -- `{ plugins: { "@tailwindcss/postcss": {} } }`
  - `eslint.config.mjs` -- `defineConfig` with `core-web-vitals` + `typescript`, `globalIgnores`
- [x] **1.3** Design system in `app/globals.css`
  - `@import "tailwindcss"` then `:root` variables then `@theme inline` block
  - Full alpine palette (powder, glacier, midnight, alpine, spritz, pine, mist)
- [x] **1.4** Firebase setup
  - `lib/firebase.ts` -- singleton init (reuse ello-owt pattern), env var validation, browser-only guard, offline persistence via `persistentLocalCache()`
  - `.env.local` / `.env.example` -- `NEXT_PUBLIC_FIREBASE_*` vars
  - `firestore.rules` -- open read/write (no auth)
  - `firestore.indexes.json` -- composite indexes for attendance + meals queries
- [x] **1.5** TypeScript types in `lib/types.ts`
  - Interfaces: `Trip`, `Participant`, `Attendance`, `Meal`, `Basecamp`, `LocalUser`

**Verify:** `npm run dev` starts, `npm run build` succeeds, `npm run lint` passes.

---

### Phase 2: App Shell, Navigation & User Identity

**Objective:** Responsive nav shell with 4 tabs and first-visit user setup flow.

**Dependencies:** Phase 1 (project scaffolding must exist).

- [x] **2.1** Root layout (`app/layout.tsx`)
  - Inter font via `next/font/google`
  - Metadata: title "Apres-Ski", description, OG tags
  - Wrap children in `<UserProvider>`
- [x] **2.2** User identity system
  - `components/providers/UserProvider.tsx` (client component)
    - Reads `localStorage('apres-ski-user')` on mount
    - Exposes `{ user, isReady, needsSetup, saveUser }` via React context
    - `saveUser` creates participant doc in Firestore + saves to localStorage
    - When `needsSetup` is true, renders `<UserSetupModal>`
  - `components/UserSetupModal.tsx`
    - Name input, color picker grid (10 predefined alpine colors), auto-generated avatar (initials), "Join Trip" button
- [x] **2.3** Responsive navigation shell
  - `components/layout/AppShell.tsx` -- desktop: `<DesktopHeader>`, mobile: `<MobileTabBar>`
  - `components/layout/DesktopHeader.tsx` -- top bar with logo + 4 nav links (md+)
  - `components/layout/MobileTabBar.tsx` -- fixed bottom bar with 4 icon+label tabs (<md)
  - Tabs: Hub `/`, Rostrum `/rostrum`, Feasts `/feasts`, Basecamp `/basecamp`
  - Content area: `pb-20 md:pb-0` for mobile tab clearance
  - Icons: inline SVGs (Home/Mountain, Bed/Calendar, Utensils, MapPin)
- [x] **2.4** Base UI components (`components/ui/`)
  - `Card.tsx` -- `bg-glacier rounded-2xl shadow-sm p-5`
  - `Button.tsx` -- primary (`bg-alpine`), secondary (outline), pill-shaped
  - `Modal.tsx` -- bottom sheet on mobile, centered on desktop
  - `Avatar.tsx` -- colored circle with initials
  - `CopyButton.tsx` -- click-to-copy with "Copied!" feedback
  - `StatusBadge.tsx` -- unassigned (grey) / claimed (blue) / confirmed (green)

**Verify:** App loads, UserSetupModal appears on first visit, nav works across all 4 routes.

---

### Phase 3: Basecamp View (Simplest CRUD -- Establishes Firebase Patterns)

**Objective:** Full read/write for chalet info. Establishes the Firestore hook + action pattern used by all subsequent views.

**Dependencies:** Phase 2 (shell and user identity).

- [x] **3.1** Data hook: `lib/hooks/useBasecamp.ts`
  - `onSnapshot` listener on `doc(db, 'basecamp', 'current')`
  - Returns `{ basecamp, loading, error }`
- [x] **3.2** Write actions: `lib/actions/basecamp.ts`
  - `updateBasecamp(fields)` -> `setDoc` with merge
- [x] **3.3** Page: `app/basecamp/page.tsx`
  - Wraps components, passes data from `useBasecamp`
- [x] **3.4** Components
  - `components/basecamp/MapEmbed.tsx` -- Google Maps static iframe with coordinates
  - `components/basecamp/AddressBlock.tsx` -- address text + `CopyButton`
  - `components/basecamp/EssentialsGrid.tsx` -- 2-column grid:
    - WiFi (network + password with `CopyButton`)
    - Check-in / Check-out times
    - Access codes (with `RevealField.tsx` click-to-reveal)
    - Emergency contacts list
  - `components/basecamp/EditBasecampModal.tsx` -- full form for all fields
  - `components/ui/RevealField.tsx` -- click-to-reveal for sensitive info

**Verify:** Add chalet info, refresh page, data persists. Edit fields, see updates immediately.

---

### Phase 4: Rostrum View (Attendance Timeline)

**Objective:** Interactive timeline grid where participants toggle daily presence.

**Dependencies:** Phase 3 (Firebase patterns established).

- [x] **4.1** Data hooks
  - `lib/hooks/useParticipants.ts` -- `onSnapshot` on `participants` collection
  - `lib/hooks/useAttendance.ts` -- `onSnapshot` on `attendance` collection
  - `lib/hooks/useTrip.ts` -- `onSnapshot` on `doc(db, 'trips', 'current')`
- [x] **4.2** Write actions: `lib/actions/attendance.ts`
  - `toggleAttendance(participantId, date, currentlyPresent)` -- sets/deletes attendance doc using composite ID `{participantId}_{date}`
- [x] **4.3** Utilities
  - `lib/utils/dates.ts` -- `getDateRange(start, end)` -> `YYYY-MM-DD[]`, `formatDateShort(date)` -> `"Fri 12"`, `isToday(date)` -> boolean
- [x] **4.4** Page: `app/rostrum/page.tsx`
- [x] **4.5** Components
  - `components/rostrum/TimelineMatrix.tsx` -- horizontally scrollable container, sticky left column (names + avatars), date header row
  - `components/rostrum/TimelineRow.tsx` -- one participant's row with colored presence bars
  - `components/rostrum/TimelineCell.tsx` -- tap to toggle, colored (participant color) when present, grey when absent

**Verify:** See participant in grid, tap cells to toggle presence, colors match participant, data persists on refresh.

---

### Phase 5: Feasts View (Meals & Apero)

**Objective:** Date-scoped meal planner where participants claim apero/dinner duties.

**Dependencies:** Phase 4 (participants and attendance data exist).

- [ ] **5.1** Data hook: `lib/hooks/useMeals.ts`
  - `onSnapshot` on `meals` collection, filtered by `tripId`
- [ ] **5.2** Write actions: `lib/actions/meals.ts`
  - `claimApero(date, user)` -- set apero assignment
  - `claimDinner(date, user)` -- set dinner assignment
  - `updateMealDetails(date, section, fields)` -- edit notes/menu/tags
  - `unclaimMeal(date, section)` -- release assignment
- [ ] **5.3** Page: `app/feasts/page.tsx`
- [ ] **5.4** Components
  - `components/feasts/DateScroller.tsx` -- horizontal scrollable date pills, today highlighted in alpine-blue
  - `components/feasts/DayMealCard.tsx` -- card for selected date with two sections
  - `components/feasts/AperoSection.tsx` -- spritz-orange accent, avatar of assigned person, notes field, claim button
  - `components/feasts/DinnerSection.tsx` -- chef avatar, menu text area, dietary tag chips
  - `components/feasts/ClaimModal.tsx` -- select yourself to claim, add notes/menu, dietary tags
  - `components/ui/DietaryTag.tsx` -- small pill chips ("Vegetarian", "Gluten-Free", etc.)

**Verify:** Scroll dates, claim apero/dinner, add menu details, see assigned person's avatar, data persists.

---

### Phase 6: Hub Dashboard

**Objective:** At-a-glance summary of today's trip status. Aggregates data from all other views.

**Dependencies:** Phases 3-5 (all data sources must exist).

- [ ] **6.1** Data derivation (no new hooks -- reuses existing)
  - Today's arrivals: participants whose first present date is today
  - Today's departures: participants whose last present date is today
  - Tonight's chef: dinner assignment for today
  - Apero duty: apero assignment for today
  - Countdown: days until `trip.startDate` or "Day X" during trip
- [ ] **6.2** Utility: `lib/utils/countdown.ts`
  - `getCountdownText(startDate, endDate)` -> `"3 days until the trip!"` / `"Day 2 of 7"` / `"Hope you had fun!"`
- [ ] **6.3** Page: `app/page.tsx`
- [ ] **6.4** Components
  - `components/hub/HeroHeader.tsx` -- background mountain image (`public/images/hero-mountain.webp`) + countdown overlay text
  - `components/hub/TodaySnapshot.tsx` -- card with arrivals, departures, chef, apero
  - `components/hub/QuickActions.tsx` -- "Navigate to Chalet" (maps deep link), "View WiFi" (copy popup)

**Verify:** Hub shows countdown, today's snapshot populates from real data entered in other views.

---

### Phase 7: Polish & Production Readiness

**Objective:** Handle edge cases, improve perceived performance, prepare for deployment.

**Dependencies:** Phases 1-6 complete.

- [ ] **7.1** Empty states for all views
  - No participants yet
  - No meals assigned
  - No basecamp info configured
  - No trip configured
- [ ] **7.2** Loading skeletons while Firestore loads
- [ ] **7.3** Trip setup flow
  - Simple form to configure trip name, start/end dates
  - Accessible from Hub when no trip exists
- [ ] **7.4** Meal seed/init flow
  - Auto-create meal docs for each date in the trip range
- [ ] **7.5** Offline indicator
  - Firestore persistence handles data automatically
  - Show subtle banner when offline
- [ ] **7.6** PWA support
  - `manifest.json` for add-to-homescreen
- [ ] **7.7** OG meta tags for link sharing
- [ ] **7.8** `lib/utils/colors.ts` -- 10 predefined participant colors

**Verify:** All empty states render correctly, loading skeletons appear briefly, app works offline, installable via PWA prompt.

---

## End-to-End Verification Flow

After all phases are complete, this flow should work seamlessly:

1. Open app -> `UserSetupModal` appears -> enter name, pick color -> see Hub
2. Hub shows countdown, empty state for today's snapshot
3. Navigate to Basecamp -> add chalet address, WiFi, access codes -> data persists on refresh
4. Navigate to Rostrum -> see yourself in grid -> tap cells to toggle daily presence
5. Navigate to Feasts -> scroll dates -> claim apero/dinner -> add menu details
6. Return to Hub -> today's snapshot populated with live data from other views
7. Open in second browser tab -> see real-time updates from first tab
8. Close tab, reopen -> data still there (offline persistence)

**Per-phase checks:** `npm run dev` (no errors), `npm run build` (succeeds), `npm run lint` (passes).
