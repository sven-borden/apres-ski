# Apres-Ski — Functional Specification

> This document describes **what the application does** — its purpose, features, rules,
> and behaviors — independent of any specific visual design, color palette, layout, or
> internal code structure. It is intended as a complete functional blueprint from which
> the application could be rebuilt from scratch on any technology stack.

---

## 1. Purpose & Concept

Apres-Ski is a **shared ski-trip organizer** for a group of friends who rent a chalet
together for a few days. One group, one trip at a time. It answers the practical
questions a self-organizing ski group repeatedly asks:

- When does the trip start, and how many days until then?
- Who is coming, and who is actually present on each individual day?
- What's the weather and snow like at the resort?
- Who is cooking dinner each night, and what are they making?
- What do we need to buy, and has someone already bought it?
- Where is the chalet, what's the Wi-Fi, when do we check in/out, who do we call in an emergency, and where do we settle shared expenses?

The product is deliberately **low-friction and trust-based**:

- **No accounts, no passwords, no login.** A person opens a shared link, types their
  name, picks a color, and they are "in." Identity lives on their own device.
- **Single shared trip.** The whole group collaborates on exactly one trip dataset.
  There is no concept of multiple trips, organizations, or tenancy.
- **Real-time-ish collaboration.** Everyone sees everyone else's changes within a few
  seconds without manual refresh.
- **Mobile-first and installable.** It behaves like an app on a phone (a Progressive Web
  App) and keeps working with a flaky mountain internet connection.

The trust model is intentional: anyone with the link can read and edit everything. There
is no permission hierarchy, no "owner," no moderation. Social norms — not software — keep
the data honest. The only friction the app deliberately adds is a **confirmation prompt
before destructive or other-affecting actions** (e.g. marking *someone else* as absent,
deleting a shopping item, shrinking trip dates so meals fall outside the range).

---

## 2. Core Domain Concepts

The application revolves around six data concepts. Everything the user does is a
manipulation of one of these.

### 2.1 Trip

The single top-level container. There is always at most one trip ("the current trip").

| Field | Meaning |
|-------|---------|
| `name` | Free-text name of the trip (e.g. "Verbier 2026"). Required, up to ~200 chars. |
| `startDate` | First day of the trip, a calendar date (`YYYY-MM-DD`). |
| `endDate` | Last day of the trip, inclusive. Must be ≥ `startDate`. |
| `createdAt` / `updatedAt` | Audit timestamps. |
| `updatedBy` | Identity of whoever last edited. |

The trip's date range **defines the set of days** that meal planning, attendance, and the
day carousel iterate over. The range is inclusive of both endpoints — a trip from the 5th
to the 8th has four days (5, 6, 7, 8).

When a trip is created or its dates change, the system **seeds a meal record for every day
in the range** plus one special "general" record (see §2.4). Seeding is idempotent: days
that already have a meal record are left untouched.

### 2.2 Participant (Crew member)

A person on the trip.

| Field | Meaning |
|-------|---------|
| `id` | Stable unique identifier assigned by the backend on creation. |
| `name` | Display name. Required, minimum 2 characters, up to ~100 chars. |
| `color` | A hex color (`#rrggbb`) chosen from a fixed palette; used to identify the person visually (avatar tint). |
| `avatar` | Short initials string (derived from the name; up to ~4 chars). |
| `joinedAt` | When they joined. |
| `tripId` | Always the current trip. |

Participants are created in two ways:
1. **Self-registration** — the first time anyone opens the app, they are prompted to set
   themselves up (name + color). This both creates a participant record *and* stores their
   identity locally on their device.
2. **Manual addition** — anyone can add other crew members from the Crew screen (e.g. to
   add a friend who hasn't opened the link yet, or to represent someone offline).

Participants can be **edited** (name, color, avatar) but the UI provides **no delete**.
The roster only grows; this is a deliberate simplification of the trust model.

The current device's own identity (the "local user") is the participant whose `id` is
stored in local device storage. This linkage matters because:
- The local user is treated specially in attendance (you can toggle *yourself* without a
  confirmation prompt, but marking *others* absent asks first).
- Edits and writes are attributed to the local user (`updatedBy`).

### 2.3 Attendance

Tracks **which participant is present on which specific day**. This is what lets the group
plan per-day headcounts (some people arrive late, some leave early, some skip a day).

Attendance is modeled as **presence-by-existence**:
- A record `(participant, date, present=true)` existing means "this person is here that day."
- Toggling someone **on** creates the record.
- Toggling someone **off** deletes the record.

There is a uniqueness constraint on `(participantId, date)` — a person can be present on a
given date at most once. Each attendance record also denormalizes the participant's name
and color at the time, so the timeline can render without a separate lookup.

By default a newly-added participant is **not** marked present on any day; presence is an
explicit, per-day opt-in on the attendance timeline.

### 2.4 Meal

One record **per trip day**, plus one special **"general"** record. A meal captures both
the dinner plan and the shopping needed for that day.

| Field | Meaning |
|-------|---------|
| `date` | Either a calendar date (`YYYY-MM-DD`) or the literal string `"general"`. |
| `responsibleIds` | Array of participant IDs who are cooking that day ("the chefs"). Up to ~20. |
| `description` | Free text describing the menu (e.g. "Raclette + salad"). Up to ~500–2000 chars. |
| `shoppingList` | Array of shopping items needed for this day's meal (see §2.5). Up to ~100 items. |
| `excludeFromShopping` | Boolean. When `true`, this day's items are omitted from the consolidated shopping list. |
| `updatedAt` / `updatedBy` | Audit fields. |

The **"general" meal** is not tied to a calendar day. It holds trip-wide shopping items
that are not part of a specific dinner: aperitif snacks and drinks, sandwich ingredients
for on-slope lunches, breakfast items, etc. It has the same shopping-list capabilities as a
day meal but no chefs and no dinner description.

A meal is considered "assigned"/non-empty when it has at least one chef, a description, or
at least one shopping item. Empty seeded meals are placeholders.

### 2.5 Shopping Item

An element of a meal's shopping list.

| Field | Meaning |
|-------|---------|
| `id` | Unique identifier (generated client-side when added). |
| `text` | The thing to buy (e.g. "Gruyère", "potatoes", "white wine"). |
| `checked` | Whether it has been purchased/acquired. |
| `quantity` | Optional numeric amount. |
| `unit` | Optional unit of measure. |

The supported units are a closed set:
`kg`, `g`, `L`, `dL`, `cl`, `pcs` (pieces), `bottles`, `packs`.

Quantity and unit are optional — an item can be just a name. Quantities can be set manually
or estimated by AI (see §6).

### 2.6 Basecamp (Chalet info)

A single record holding everything about the lodging and logistics.

| Field | Meaning |
|-------|---------|
| `name` | Chalet / accommodation name. |
| `address` | Postal address (free text, multi-line). |
| `coordinates` | `{ lat, lng }` for the map. |
| `mapsUrl` | A link to open the location in an external maps app. |
| `wifi` | `{ network, password }`. |
| `checkIn` / `checkOut` | Free-text arrival/departure info (e.g. "Sat 16:00"). |
| `capacity` | Number of beds/sleeping spots (0–200). |
| `emergencyContacts` | List of `{ name, phone, role }` entries. |
| `notes` | Free-text catch-all (house rules, parking, etc.). Up to ~5000 chars. |
| `tricountUrl` | Link to an external shared-expense tracker (Tricount) for the group. |

### 2.7 Weather

A single cached weather snapshot for the resort location (La Tzoumaz / Verbier area,
~46.08°N 7.23°E).

| Field | Meaning |
|-------|---------|
| `temperature` | Current temperature (°C). |
| `temperatureMin` / `temperatureMax` | Today's forecast low/high. |
| `weatherCode` | A WMO weather code (mapped to an emoji + label). |
| `snowDepth` | Snow depth in centimeters. |
| `freezingLevel` | Average freezing-level altitude in meters. |
| `fetchedAt` | When the snapshot was taken (for staleness checks). |

---

## 3. User Identity & Onboarding

### 3.1 First visit

On first load, the app checks the device's local storage for a saved identity. If none
exists, it shows a **mandatory setup modal** before the user can use the app:

1. Choose interface language (French/English toggle is available right in the modal).
2. Enter a name (minimum 2 characters).
3. Pick a color from the fixed palette.
4. A live avatar preview (initials on the chosen color) is shown.
5. Press "Join."

On join, the app:
- Creates a **participant record** in the shared dataset.
- Saves the **local user** (the returned participant `id`, name, color, avatar) to device
  local storage so the device is recognized on subsequent visits.
- Records an analytics "sign up" event.

Crucially, the participant's `id` is the backend-assigned id, and that same id is stored
locally — this keeps the device's identity, its attendance records, and its meal/edit
attributions all referring to the same participant.

### 3.2 Returning visits

If a local identity exists, the app loads straight to the Hub. The identity is read using a
mechanism that avoids hydration mismatches (the stored value is read once and cached, and
listeners are notified on change).

### 3.3 Identity is per-device

There is no cross-device identity sync. Opening the link on a phone and a laptop creates two
separate local identities unless the user re-uses the same participant. This is acceptable
within the trust model.

---

## 4. Screens & Features

The application has **five primary screens**, reachable by persistent navigation (bottom
tab bar on mobile, top navigation on larger screens). Each screen follows the same
lifecycle: a loading skeleton → an empty/setup state if there's no data yet → the populated
view.

### 4.1 Hub (Home / Dashboard) — `/`

The at-a-glance overview of the whole trip. It composes several widgets:

1. **Hero / countdown.** Shows the trip name and dates, and a countdown that adapts to the
   trip phase:
   - **Before** the trip: "in N days."
   - **During** the trip: "Day X of Y" and a rotating fun ski quote keyed to the day number.
   - **After** the trip: a closing "hope you had fun" message.
   The countdown is computed against the device's local "today."

2. **Chalet snippet.** A compact summary of the basecamp (name, a hint of address/photo)
   with a link to the full Basecamp screen. Only shown if basecamp info exists.

3. **Meal nudge.** A prompt showing how many trip days still have **no cook assigned**,
   encouraging someone to claim a night. Counts days where the meal is missing or has zero
   `responsibleIds`.

4. **Day carousel ("schedule").** A horizontally scrolling strip of cards, one per trip
   day, each showing the date, who's present that day (avatars), and the meal summary. The
   carousel **auto-scrolls to the relevant day**: today if the trip is in progress,
   otherwise the start date. The current day is badged "Today."

5. **Attendance strip.** A condensed visualization of headcount per day across the trip,
   compared against chalet capacity, with a link to the full Crew screen.

6. **Weather widget.** Current conditions for the resort: a weather emoji + label, snow
   depth in cm, current temperature with today's min/max, freezing level in meters, and a
   playful "snow vibe" caption derived from snow depth (e.g. "powder paradise" ≥100cm,
   down to "no snow" at 0cm). When snow depth exceeds 10cm the widget is visually
   emphasized. If weather data can't load, it shows an "unavailable" message instead of
   failing.

If **no trip exists yet**, the Hub instead offers a "Set up trip" call-to-action that opens
the trip editor.

### 4.2 Feasts (Meals & per-day shopping) — `/feasts`

The meal-planning screen. It is driven by a selected day.

- A **date scroller** lets the user pick any trip day, plus a "General" tab for trip-wide
  items. The currently selected day is reflected in the URL (`?date=YYYY-MM-DD` or
  `?date=general`), so a specific day can be linked/bookmarked. On open it defaults to
  today if today is within the trip, otherwise the first day; if the URL date is invalid it
  falls back to "general."

- For a **specific day**, the screen shows a **Day Meal Card** containing:
  - The long-form date and the **effective headcount** for that day (see §5.1).
  - A **dinner section**: who's cooking (chef avatars) and the menu description, with an
    "edit" affordance.
  - A **shopping list** for that day's meal (see §4.6 for shopping-list behavior).

- For the **"General" tab**, it shows a **General Card** with a subtitle explaining it
  covers apéro, lunches, and breakfast, the trip-wide headcount (sum of person-days, see
  §5.1), and a shopping list in "general" mode.

**Editing a dinner** (modal):
- Pick one or more chefs from the participant list (multi-select).
- Enter/adjust the menu description (free text, up to ~500 chars).
- Validation: the meal must have **either at least one chef or a non-empty description**
  (you can't save a completely empty dinner). The error clears as soon as either is
  provided.
- Saving attributes the change to the local user and records a "dinner saved" analytics
  event with the chef count.

### 4.3 Shopping (Consolidated list) — `/shopping`

A single combined shopping list aggregated across **all** meal days plus the general list.
This is the "what we actually need to buy as a group" view.

Behavior:
- It **flattens every shopping item from every meal** (skipping any day whose meal has
  `excludeFromShopping = true`) into one list.
- Items with the **same text** are merged by default (case-insensitive, trimmed).
- A **progress card** shows `checked / total` and a progress bar; when everything is
  checked it shows an "all done" message, otherwise "N items remaining."
- Unchecked items are shown first; checked ("purchased") items are collapsed under an
  expandable "Purchased (N)" section.
- Checking an item here checks it **everywhere it came from**. Because one consolidated
  line can represent items spread across multiple days, toggling it writes back to each
  source day (grouped by date, one write per date, performed in parallel).
- A consolidated line can be **partially checked** (some sources bought, some not),
  represented by an indeterminate state.
- For merged lines, an expandable "show details" reveals each source: which day/meal it
  came from and its individual quantity.
- Quantities from multiple sources are **summed intelligently by unit family** (see §5.3),
  shown next to the line.
- Newly-checked items linger briefly (~2 seconds) in the unchecked list before moving down
  to "purchased," so the user sees the action register without the row vanishing instantly.

**Smart Merge (AI grouping):** a button triggers an AI pass that groups *similar* items
(spelling variants, different languages, different specificity — e.g. "patates", "potatoes",
"pommes de terre") under a single canonical name, and assigns every item to a grocery-store
**category** (Produce, Dairy, Meat & Fish, Bakery, Pantry, Beverages, Frozen, Snacks &
Apéro, Condiments & Sauces, Other — localized). After a successful merge the list is
displayed **grouped by category in grocery-aisle order**. See §6.2.

### 4.4 Crew (Participants & attendance timeline) — `/crew`

Roster management and the per-day attendance grid.

- **Add member**: opens a modal to create a participant (name ≥2 chars + color, with avatar
  preview). Records a "crew member added" event.
- **Edit member**: tap a participant to edit name/color/avatar.
- **Attendance timeline (matrix):** a grid with participants as rows and trip days as
  columns. Each cell is a toggle: present or not, for that person on that day.
  - A **capacity row** at the top shows the headcount per day vs. the chalet capacity, with
    visual warning when a day is over capacity (e.g. emphasized when count exceeds ~110%,
    stronger warning beyond ~120%).
  - Toggling **your own** attendance is immediate.
  - Toggling **someone else** *from present to absent* asks for confirmation first
    ("mark X as absent?"). Marking present is immediate.
  - The current day's column is highlighted.
  - Participants are shown in a stable sorted order.

If there's no trip, Crew points the user to set one up first. If there are no participants
yet, it shows an empty state with the add affordance.

### 4.5 Basecamp (Chalet info) — `/basecamp`

The logistics hub. Two editable sections:

- **Trip section:** trip name and date range, with an edit button opening the trip editor.
  If no trip exists, offers "Set up trip."
- **Chalet section:** when basecamp info exists, shows:
  - Chalet name and an **embedded map** (from coordinates / maps link).
  - **Address** block (with the address text).
  - An **essentials grid**:
    - **Wi-Fi**: network name (copy button) and password (reveal + copy).
    - **Schedule**: check-in, check-out, capacity (in beds).
    - **Tricount**: a link out to the shared-expense tracker (only shown if a URL is set).
    - **Emergency contacts**: each with name, optional role, and a tappable `tel:` phone link.
  - **Notes**: free-text, preserving line breaks.
  - Empty sub-cards show "not configured" rather than disappearing.
  If no basecamp exists, offers "Set up basecamp."

**Editing the trip from here** additionally guards against orphaning data: if you shrink the
date range such that days with already-assigned meals fall outside the new range, it warns
("this will leave N planned meals outside the trip dates") and asks for confirmation before
saving.

### 4.6 Shopping list (shared per-meal & general behavior)

The shopping-list control used inside both the Day Meal Card and the General Card supports:

- **Add items:** a text box; multiple items can be added at once by entering one per line.
  Each becomes an unchecked item with a generated id. Submitting on Enter (Shift+Enter for a
  new line). Records an "item added" event per item.
- **Check/uncheck:** tap an item to toggle purchased state. Unchecked items sort above
  checked ones.
- **Edit text:** tap an item's text to edit inline (Enter saves, Escape cancels, blur saves;
  empty or unchanged is ignored).
- **Edit quantity/unit:** tap the quantity (or a "+" if none) to inline-edit a numeric
  amount and pick a unit from the closed unit set (or "—" for none). Clearing the number
  removes the quantity entirely.
- **Remove:** an explicit delete affordance, **guarded by a confirmation dialog**
  ("remove X?").
- **AI estimate quantities:** a button (shown only when there are unchecked items lacking a
  quantity, and — for a dinner — a menu description exists, or — for general — headcount ≥1)
  that calls the AI estimator (§6.1). It **only fills in items that don't already have a
  quantity** (manually-set quantities are preserved). Records "quantities estimated."
  Handles rate-limit (429) with a friendly message.
- **Reset quantities:** clears all quantities/units on the list (shown only when some exist),
  behind a confirmation dialog. Records "quantities reset."
- **Exclude from shopping toggle (day meals only):** a switch to omit this day's items from
  the consolidated shopping list (useful when a meal is, say, eating out).

---

## 5. Key Calculations & Rules

### 5.1 Headcount logic

Headcount drives meal portion estimates. For a **specific day**, the effective headcount is:

- the number of participants explicitly marked present that day, **if at least one** is
  marked present;
- otherwise it **falls back to the total number of participants** (assume everyone is there
  if nobody has marked attendance yet).

For the **general** (trip-wide) list, the relevant measure is **total person-days**: the sum
across all trip days of each day's effective headcount. This represents the total "people ×
days" the trip needs to be provisioned for (used to estimate apéro/breakfast/lunch volumes).

### 5.2 Countdown states

Given the trip start/end and the device's local today (all compared at local midnight):

- `today > endDate` → **after** state.
- `startDate - today > 0 days` → **before** state, reporting whole days until start.
- otherwise → **during** state, reporting `dayNum` (1-based day index since start) and
  `totalDays` (inclusive length of the trip).

### 5.3 Quantity summing across units

When combining quantities of the same logical item from multiple sources, units are summed
**within compatible families**, and the result is displayed in the most natural unit:

- **Mass family** (`g`, `kg`): summed in grams; displayed as kg when ≥1000g, else g
  (rounded to 2 decimals).
- **Volume family** (`cl`, `dL`, `L`): summed in centiliters; displayed as L when ≥100cl,
  as dL when a clean multiple of 10cl, else cl.
- **Count units** (`pcs`, `bottles`, `packs`): summed **only with the same unit** (you
  can't add bottles to packs); unitless quantities are treated as pieces.

If multiple incompatible families are present for one merged line, the total is shown as a
**breakdown** (e.g. "2 kg + 3 bottles"). If no source has a quantity, no total is shown.

### 5.4 Weather mapping

- The numeric WMO weather code is mapped to an **emoji + a localized condition label**
  (clear sky, partly cloudy, light snow, thunderstorm, etc.); unknown codes render a
  generic "unknown."
- The **snow vibe** caption is bucketed by snow depth: ≥100cm, ≥50cm, ≥30cm, ≥10cm, >0cm,
  and 0cm, each mapping to a localized phrase.
- Snow depth is stored/displayed in **centimeters** (the upstream source provides meters and
  it is converted on fetch).

### 5.5 Validation rules (summary)

- **Trip:** name required; start/end required; end ≥ start. Editing existing trip dates that
  would orphan assigned meals → confirmation.
- **Participant / user setup:** name ≥ 2 characters; color from the palette.
- **Dinner:** at least one chef OR a non-empty description.
- **Shopping item text:** up to ~100 chars (when editing) / ~500 when adding raw; quantities
  are non-negative numbers; units restricted to the closed set.
- **Basecamp:** bounded field lengths; capacity 0–200; coordinates numeric; emergency
  contacts list bounded (~20).

---

## 6. AI-Powered Features

The app uses an LLM for two non-essential but high-value conveniences. Both are
**server-side**, **rate-limited**, and degrade gracefully (the app remains fully usable if
AI is unavailable or fails).

### 6.1 Quantity estimation

**Goal:** estimate sensible grocery quantities for the items on a shopping list, given the
context (what's being cooked, and for how many people).

**Inputs:** a category (`dinner` or `general`), a headcount, the list of items (id + text),
and — for dinner — the menu description.

**Behavior / prompt intent:**
- For a **dinner**: estimate generous portions for "hungry skiers after a full day on the
  slopes" (~20–30% above standard servings). Items that are clearly apéro/drinks/snacks and
  not part of the dinner recipe get a null quantity. When unsure, estimate anyway.
- For **general** supplies: the headcount is interpreted as total **person-days**; covers
  apéro, ski-lunch sandwiches, and breakfast; hot breakfast items (pancakes/crêpe batter)
  are estimated very generously.
- Quantities are rounded to **practical shopping amounts** (e.g. "2 packs," not "1.7 packs").
- Output is restricted to the **closed unit set**; invalid units are dropped to null. The
  server validates/sanitizes the model output into `{ id, quantity|null, unit|null }`.

Only items that **lack** a quantity are updated client-side; manual entries are never
overwritten.

### 6.2 Item grouping & categorization ("Smart Merge")

**Goal:** turn a messy multilingual list of duplicates into a clean, deduplicated,
aisle-ordered list.

**Inputs:** the list of unique items (id + text) and the current locale.

**Behavior / prompt intent:**
- Group duplicate/similar items (spelling variants, languages, specificity) under one
  **canonical name**.
- Assign **every** item — including singletons — to a grocery-store **category**.
- Return categories in **grocery-aisle order**.
- Use the current language for category and canonical names; a suggested category set is
  provided (Produce/Dairy/Meat & Fish/Bakery/Pantry/Beverages/Frozen/Snacks & Apéro/
  Condiments & Sauces/Other, localized), with freedom to add categories.
- The model returns structured output (a categories→items→{canonicalName, itemIds}
  hierarchy); the server validates and tolerates both naming conventions.

**Client caching:** the grouping result is cached per a **fingerprint** of the item set +
locale (in session storage). If the underlying items change, the fingerprint changes and the
cached grouping is invalidated, falling back to exact-text grouping until a fresh merge is
requested. This avoids redundant AI calls while editing.

### 6.3 Abuse controls (shared by both AI endpoints)

- **Optional bearer-token auth:** if a token is configured, requests must carry it.
- **Per-IP rate limiting:** at most one request every ~12 seconds, and ~50 requests per day
  (the daily counter resets at UTC midnight). Over-limit returns HTTP 429 with a friendly
  message.
- **Geographic restriction:** AI (and all API) requests are only served to Switzerland and
  its bordering countries (CH, FR, DE, AT, IT, LI); requests with no detectable country
  (e.g. local development) are allowed through. Others receive HTTP 403.

---

## 7. Data Synchronization & Offline Behavior

### 7.1 Real-time-ish sync

The app presents live, shared state: every screen reads its data through hooks that return
`{ data, loading, error }` and keep that data fresh automatically. In practice this is
achieved by **polling read endpoints on a short interval** (a few seconds for most data),
with these refinements:

- Polling **pauses while the browser tab is hidden** and **fetches immediately** when the
  tab becomes visible again, to save bandwidth/battery.
- Weather is polled on a **much slower cadence** (every few minutes) because it changes
  hourly at most.

Writes are performed as discrete actions attributed to the local user; the next poll
reflects them for everyone. (The architecture anticipates upgrading the transport to
server-pushed real-time updates without changing how screens consume data.)

### 7.2 Weather freshness

The weather endpoint serves a cached snapshot. When that snapshot is **older than ~1 hour**,
the server re-fetches from the upstream weather provider (Open-Meteo, free, no key) for the
fixed resort coordinates and upserts the single cached record. Clients never call the
weather provider directly.

### 7.3 Offline support (PWA)

- The app is an installable **Progressive Web App** (it has a web manifest and app icons,
  and can be added to a phone's home screen).
- It detects connectivity and shows an **offline banner** when the device is offline.
- It is designed to keep displaying the last-known data while offline and reconcile when the
  connection returns.

---

## 8. Internationalization

- The app is **fully bilingual: French and English**, with **French as the default**.
- A language toggle is available throughout (including in the very first setup modal).
- All user-facing strings — labels, validation messages, confirmation dialogs, weather
  condition names, snow-vibe captions, unit names, countdown phrasing, error toasts — come
  from translation tables; there are no hard-coded display strings in the UI.
- The chosen language is **persisted on the device** and restored on return.
- Some text is **parameterized** (e.g. "in N days," "Day X of Y," "N items remaining,"
  "headcount: N," "remove X?") and pluralized/formatted per locale, including locale-aware
  **date formatting** (short weekday+day, and long weekday/month/day forms).
- AI category and canonical names are generated **in the active language**.

---

## 9. Analytics & Privacy

The app emits **privacy-respecting product analytics** (self-hosted, cookie-light) via typed
event helpers that are **no-ops until the analytics script loads** and never block features.
Tracked events include:

- `sign_up` (user setup completed)
- `page_view`
- `trip_saved` (with whether it was new)
- `basecamp_saved` (with whether it was new)
- `crew_member_added`, `crew_member_edited`
- `attendance_toggled` (present/absent)
- `dinner_saved` (with chef count)
- `shopping_item_added` / `_toggled` / `_removed`
- `quantities_estimated` (item count) / `quantities_reset`
- `smart_merge` (item count) / `consolidated_toggle` (checked + source count)
- `weather_refreshed`

No personal data beyond a self-chosen display name is collected, and there is no
authentication or tracking identity tied to real-world accounts.

---

## 10. Security & Abuse Posture

Even without authentication, the product defends against casual abuse and bad input:

- **Field-level validation on writes:** types, formats (date strings `YYYY-MM-DD`, hex
  colors `#rrggbb`), and bounded lengths/sizes are enforced on the data layer (e.g. names,
  notes, list sizes, capacity ranges). Malformed writes are rejected.
- **Closed enumerations:** shopping units and palette colors are fixed sets.
- **No destructive deletes of core records:** trips, basecamp, participants, meals, and
  weather cannot be deleted through the normal data rules; only attendance records are
  deletable (that's how "absent" is expressed). The roster and history only grow.
- **Server-only secrets:** the AI provider key lives only on the server; the backend
  database is reached only through server-side code, never directly from the browser.
- **API hardening:** rate limiting + optional bearer token + geo-restriction on all API
  routes (see §6.3).
- **Confirmation prompts** before actions that affect others or destroy data (mark someone
  absent, delete a shopping item, reset quantities, shrink trip dates that orphan meals).
- **Standard web hardening:** a strict Content-Security-Policy and related security headers
  (no framing, no sniffing, restrictive referrer, disabled geolocation/mic/camera
  permissions), and the framework's "powered-by" header disabled.

---

## 11. End-to-End Flows (Walkthroughs)

These narrative flows tie the features together and can serve as acceptance scenarios.

### 11.1 Brand-new group, first organizer

1. Organizer opens the shared link. Setup modal appears; they pick a language, enter their
   name, choose a color, and join. A participant record is created; their device remembers
   them.
2. Hub shows "no trip yet." They tap "Set up trip," name it, and pick start/end dates.
   Saving seeds a meal placeholder for each day plus the general list.
3. They go to Basecamp, add the chalet name, address, map link, Wi-Fi, check-in/out,
   capacity, emergency contacts, a Tricount link, and notes.
4. They go to Crew and add the friends who are coming.
5. They go to Feasts, pick a night, assign chefs and a menu, and start a shopping list
   ("Gruyère, potatoes, white wine…"). They tap "estimate quantities" to get sensible
   amounts.
6. They share the same link in the group chat.

### 11.2 A friend joins later

1. Friend opens the link, sets themselves up (name + color). They appear in Crew.
2. On the Crew timeline, they toggle the days they'll actually be present. (If they need to
   mark someone *else* absent, they get a confirmation prompt.)
3. The Hub day carousel and attendance strip update for everyone within seconds.

### 11.3 Doing the shopping run

1. Someone heading to the supermarket opens Shopping.
2. They tap **Smart Merge** — duplicates across nights collapse into single canonical lines,
   sorted by store aisle (Produce, Dairy, …), with summed quantities.
3. In the store, they check items off; each check propagates back to every meal that needed
   it. Partially-bought merged lines show an indeterminate state.
4. When everything's checked, the progress bar reads "all done."

### 11.4 Mid-trip, weather, and dinner duty

1. During the trip, the Hub shows "Day 2 of 4," a fun quote, today's present crew, and live
   snow/temperature/freezing-level.
2. The meal nudge reminds the group that, say, "1 night still needs a cook." Someone opens
   Feasts and claims it.
3. If a night's plan changes to eating out, the cook toggles "exclude from shopping" so its
   items drop out of the consolidated list.

### 11.5 Plans change — trip dates shrink

1. The trip gets cut a day short. The organizer edits the trip end date in Basecamp.
2. Because a meal was already planned on the now-removed day, a confirmation warns that N
   planned meals would fall outside the trip dates. They confirm; the trip updates.

---

## 12. Non-Goals / Explicit Simplifications

To keep the product focused and frictionless, the following are intentionally **out of
scope**:

- **No authentication, accounts, or roles.** Anyone with the link has full read/write.
- **No multiple trips / multi-tenancy.** Exactly one current trip.
- **No participant deletion.** The roster only grows.
- **No payment/expense splitting in-app.** Shared expenses are delegated to an external
  Tricount link.
- **No chat/messaging.** Coordination happens in the group's own chat; the app just holds
  the shared facts.
- **No fine-grained meal schema.** A meal is just chefs + description + a shopping list (no
  separate courses/apéro/dinner sub-structures); trip-wide non-dinner items live in the
  single "general" list.
- **No general weather search.** Weather is hard-pinned to the one resort location.

---

## 13. Glossary

- **Trip** — the single shared event with a name and an inclusive date range.
- **Participant / Crew member** — a person on the trip; identified by name + color.
- **Local user** — the participant identity stored on the current device.
- **Attendance** — per-person, per-day presence (exists = present).
- **Meal** — per-day (or "general") record holding chefs, menu, and a shopping list.
- **General list** — the special non-day meal for apéro / lunch / breakfast / trip-wide items.
- **Shopping item** — a named thing to buy, optionally with quantity + unit, checkable.
- **Consolidated list** — all shopping items across all meals merged into one shopping view.
- **Smart Merge** — the AI pass that dedupes and categorizes the consolidated list.
- **Headcount** — present count for a day (falling back to total participants), or summed
  person-days for the trip.
- **Basecamp** — the chalet/logistics record (address, Wi-Fi, schedule, contacts, notes).
- **Snow vibe** — a playful caption derived from snow depth.
