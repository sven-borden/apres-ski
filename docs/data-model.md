# Firestore Data Model

## Overview

All data lives in Firestore with open read/write rules (no authentication). The app uses a single-trip model where the active trip and basecamp are stored with the doc ID `"current"`.

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

### `participants`

**Doc ID:** Auto-generated (matches `LocalUser.id`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Matches doc ID and localStorage user ID |
| `name` | `string` | Display name |
| `color` | `string` | Hex color from the 10-color palette |
| `avatar` | `string` | Auto-generated initials (1-2 chars) |
| `joinedAt` | `Timestamp` | Server timestamp when user joined |
| `tripId` | `string` | Always `"current"` |

### `attendance`

**Doc ID:** `{participantId}_{YYYY-MM-DD}` (composite key for direct upserts)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Matches doc ID |
| `participantId` | `string` | Reference to participant |
| `participantName` | `string` | Denormalized for display |
| `participantColor` | `string` | Denormalized for display |
| `date` | `string` | Date (`YYYY-MM-DD`) |
| `present` | `boolean` | Whether participant is present that day |
| `tripId` | `string` | Always `"current"` |

### `meals`

**Doc ID:** `YYYY-MM-DD` (one document per trip date)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Matches doc ID (the date) |
| `date` | `string` | Date (`YYYY-MM-DD`) |
| `tripId` | `string` | Always `"current"` |
| `apero` | `AperoAssignment` | See sub-schema below |
| `dinner` | `DinnerAssignment` | See sub-schema below |
| `updatedAt` | `Timestamp` | Server timestamp on last update |
| `updatedBy` | `string` | Participant ID of last editor |

**`AperoAssignment` sub-schema:**

| Field | Type | Description |
|-------|------|-------------|
| `assignedTo` | `string` | Participant display name |
| `assignedParticipantId` | `string` | Participant ID |
| `notes` | `string` | Free-text notes |
| `status` | `string` | `"unassigned"`, `"claimed"`, or `"confirmed"` |

**`DinnerAssignment` sub-schema:**

| Field | Type | Description |
|-------|------|-------------|
| `chefName` | `string` | Chef's display name |
| `chefParticipantId` | `string` | Chef's participant ID |
| `menu` | `string` | Free-text menu description |
| `dietaryTags` | `string[]` | Tags like `"Vegetarian"`, `"Gluten-Free"` |
| `status` | `string` | `"unassigned"`, `"claimed"`, or `"confirmed"` |

### `basecamp`

**Doc ID:** `"current"` (single-trip model)

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | Chalet street address |
| `coordinates` | `{ lat: number, lng: number }` | GPS coordinates for map embed |
| `mapsUrl` | `string` | Google Maps link |
| `wifi` | `{ network: string, password: string }` | WiFi credentials |
| `checkIn` | `string` | Check-in time |
| `checkOut` | `string` | Check-out time |
| `accessCodes` | `{ label: string, code: string }[]` | Door codes, lockbox codes, etc. |
| `emergencyContacts` | `{ name: string, phone: string, role: string }[]` | Emergency contact list |
| `notes` | `string` | Free-text notes |
| `updatedAt` | `Timestamp` | Server timestamp on last update |
| `updatedBy` | `string` | Participant ID of last editor |

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

Open read/write — no authentication required:

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Composite Indexes

Defined in `firestore.indexes.json`:

| Collection | Fields | Scope |
|------------|--------|-------|
| `attendance` | `tripId` (ASC), `date` (ASC) | `COLLECTION` |
| `meals` | `tripId` (ASC), `date` (ASC) | `COLLECTION` |

These indexes support queries that filter by `tripId` and order by `date`.
