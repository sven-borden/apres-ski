# Firestore Data Model

## Overview

All data lives in Firestore with field-validated security rules (no authentication, but writes are constrained by type checking, field allowlists, and bounded lengths). The app uses a single-trip model where the active trip and basecamp are stored with the doc ID `"current"`.

## Collections

### `trips`

**Doc ID:** `"current"` (single-trip model)

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Trip name (e.g., "Val Thorens 2026") |
| `startDate` | `string` | Start date (`YYYY-MM-DD`) |
| `endDate` | `string` | End date (`YYYY-MM-DD`) |
| `createdAt` | `Timestamp` | Server timestamp on creation |
| `updatedAt` | `Timestamp` | Server timestamp on last update |
| `updatedBy` | `string` | Participant ID of last editor |

### `participants`

**Doc ID:** Auto-generated UUID (matches `LocalUser.id`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Matches doc ID and localStorage user ID |
| `name` | `string` | Display name (max 100 chars) |
| `color` | `string` | Hex color from the 10-color palette (`#RRGGBB`) |
| `avatar` | `string` | Auto-generated initials (max 4 chars) |
| `joinedAt` | `Timestamp` | Server timestamp when user joined |
| `tripId` | `string` | Always `"current"` |

### `attendance`

**Doc ID:** `{participantId}_{YYYY-MM-DD}` (composite key for direct upserts)

| Field | Type | Description |
|-------|------|-------------|
| `participantId` | `string` | Reference to participant |
| `participantName` | `string` | Denormalized for display (max 100 chars) |
| `participantColor` | `string` | Denormalized for display (`#RRGGBB`) |
| `date` | `string` | Date (`YYYY-MM-DD`) |
| `present` | `boolean` | Must be `true` on create (deletion = not present) |
| `tripId` | `string` | Always `"current"` |
| `updatedAt` | `Timestamp` | Server timestamp |

Note: Attendance uses create/delete semantics — a document exists when a participant is present. There is no update; toggling "off" deletes the document.

### `meals`

**Doc ID:** `YYYY-MM-DD` (one document per trip date) or `"general"` (trip-wide items)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Matches doc ID |
| `date` | `string` | Date (`YYYY-MM-DD`) or `"general"` |
| `tripId` | `string` | Always `"current"` |
| `responsibleIds` | `string[]` | Participant IDs of assigned cooks (max 20) |
| `description` | `string` | Free-text meal description (max 2000 chars) |
| `shoppingList` | `ShoppingItem[]` | Shopping items for this meal (max 100 items) |
| `excludeFromShopping` | `boolean` | Whether to exclude this day from consolidated shopping list |
| `updatedAt` | `Timestamp` | Server timestamp on last update |
| `updatedBy` | `string` | Participant ID of last editor (max 100 chars) |

**`ShoppingItem` sub-schema:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique item ID |
| `text` | `string` | Item label (e.g., "Raclette cheese") |
| `checked` | `boolean` | Whether item has been purchased |
| `quantity` | `number?` | Optional quantity amount |
| `unit` | `ShoppingUnit?` | Optional unit of measurement |

**`ShoppingUnit` type:** `"kg" | "g" | "L" | "dL" | "cl" | "pcs" | "bottles" | "packs"`

The `"general"` document stores trip-wide shopping items not tied to a specific meal date (e.g., breakfast supplies, snacks). It is created by `ensureGeneralMeal()` or `seedMeals()`.

### `basecamp`

**Doc ID:** `"current"` (single-trip model)

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Chalet name (max 200 chars) |
| `address` | `string` | Chalet street address (max 500 chars) |
| `coordinates` | `{ lat: number, lng: number }` | GPS coordinates for map embed |
| `mapsUrl` | `string` | Google Maps link (max 2000 chars) |
| `wifi` | `{ network: string, password: string }` | WiFi credentials |
| `checkIn` | `string` | Check-in time (max 50 chars) |
| `checkOut` | `string` | Check-out time (max 50 chars) |
| `capacity` | `number` | Max occupancy (0–200) |
| `emergencyContacts` | `{ name: string, phone: string, role: string }[]` | Emergency contact list (max 20) |
| `notes` | `string` | Free-text notes (max 5000 chars) |
| `tricountUrl` | `string` | Link to Tricount expense sharing |
| `updatedAt` | `Timestamp` | Server timestamp on last update |
| `updatedBy` | `string` | Participant ID of last editor |

### `weather`

**Doc ID:** `"la-tzoumaz"` (singleton for La Tzoumaz resort)

| Field | Type | Description |
|-------|------|-------------|
| `temperature` | `number` | Current temperature (°C) |
| `temperatureMin` | `number` | Today's minimum temperature (°C) |
| `temperatureMax` | `number` | Today's maximum temperature (°C) |
| `weatherCode` | `number` | WMO weather condition code |
| `snowDepth` | `number` | Snow depth (cm) |
| `freezingLevel` | `number` | Freezing level altitude (m) |
| `fetchedAt` | `Timestamp` | When data was last fetched from Open-Meteo |

Data is fetched from [Open-Meteo API](https://open-meteo.com/) (free, no API key) and cached with a 1-hour TTL. The `useWeather` hook triggers `refreshWeather()` when the cached data is stale.

## LocalUser (localStorage)

Stored at key `apres-ski-user` in the browser. Not synced to Firestore directly — instead, a corresponding `participants` document is created on first setup.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID, matches the Firestore participant doc ID |
| `name` | `string` | Display name |
| `color` | `string` | Hex color |
| `avatar` | `string` | Auto-generated initials |
| `createdAt` | `number` | Unix timestamp (milliseconds) |

## Firestore Rules

Security rules enforce field validation, type checking, and bounded lengths per collection:

| Collection | Read | Create/Update | Delete |
|------------|------|---------------|--------|
| `trips/current` | Open | Fields allowlisted; `updatedAt` must be timestamp; field lengths bounded | Denied |
| `participants/{id}` | Open | Create: fields allowlisted, `id == docId`, color must be hex; Update: only name/avatar/color/updatedAt | Denied |
| `attendance/{docId}` | Open | DocId must match `UUID_YYYY-MM-DD`; `present` must be `true` on create; no updates allowed | Allowed (toggle off = delete) |
| `meals/{mealId}` | Open | `mealId` must match `YYYY-MM-DD`; fields allowlisted; `shoppingList` max 100 items; `responsibleIds` max 20 | Denied |
| `basecamp/current` | Open | Fields allowlisted; capacity 0–200; coordinates validated as lat/lng map | Denied |
| `weather/la-tzoumaz` | Open | All numeric fields validated; `fetchedAt` must be timestamp | Denied |

Non-matching doc IDs in `trips`, `basecamp`, and `weather` collections are denied all access.

**Note:** The `meals` rules require `mealId` to match `YYYY-MM-DD` format, which means the `"general"` doc falls through to implicit deny on writes. The `excludeFromShopping` field is also not in the rules allowlist.

## Composite Indexes

Defined in `firestore.indexes.json`:

| Collection | Fields | Scope |
|------------|--------|-------|
| `attendance` | `tripId` (ASC), `date` (ASC) | `COLLECTION` |
| `meals` | `tripId` (ASC), `date` (ASC) | `COLLECTION` |

These indexes support queries that filter by `tripId` and order by `date`.
