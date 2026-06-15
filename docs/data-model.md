# Data model

PocketBase, SQLite. Schema is **baked into the PB image** as a JS migration
(`pocketbase/pb_migrations/1718323200_init_apres_ski_schema.js`) applied
automatically on boot. Record types mirror it in `src/lib/pb/types.ts`.

All collections use **open API rules** (`""` = public) to match the trust-based,
no-auth model — safe because PocketBase is internal-only and only the Next.js
server reaches it (PROJECT.md §10).

## Collections

| Collection | Cardinality | Notes |
|---|---|---|
| `trips` | single record | `name`, `startDate`, `endDate` (YYYY-MM-DD), `updatedBy`, autodate `createdAt`/`updatedAt` |
| `basecamp` | single record | chalet info: `address`, `coordinates` (json), `wifi` (json), `checkIn/Out`, `capacity`, `emergencyContacts` (json), `notes`, `mapsUrl`, `tricountUrl` |
| `participants` | many | `name`, `color`, `avatar`, `tripId`, autodate `joinedAt` |
| `attendance` | many | presence-by-existence: a record = present. Denormalized `participantName/Color`. Unique index `(participantId, date)` |
| `meals` | one per day + `"general"` | `date`, `responsibleIds` (json string[]), `description`, `shoppingList` (json `ShoppingItem[]`), `excludeFromShopping`. Unique index `date` |
| `weather` | single record | cached Open-Meteo snapshot; `temperature`, min/max, `weatherCode`, `snowDepth` (cm), `freezingLevel`, autodate `fetchedAt` |

"Single record" collections are read via `pbFirst()` and written via
`pbUpsertSingle()` (`lib/pb/server.ts`) — no fixed ids, just first-or-create.

## Conventions

- **Dates** are timezone-free `YYYY-MM-DD` text (avoid `Date`/`toISOString`
  drift — see `lib/trip-utils.ts`).
- **JSON fields** may come back as `""` when empty; normalize with
  `Array.isArray(v) ? v : []` (helpers in the screens).
- **Attendance** = presence-by-existence: toggling present creates a record,
  absent deletes it (`setAttendance` in `lib/actions.ts`). Reads filter
  `present=true`.
- **Meal seeding**: `saveTrip` seeds an empty meal per day in range + a `general`
  meal (idempotent).

## Changing the schema

Edit/add a migration under `pocketbase/pb_migrations/` (PocketBase JS migration
API), bump the PB image, redeploy. Migrations run once and are recorded in
`_migrations`. Test locally first (see [development.md](./development.md)):
build the image, run it, curl `…/api/collections/<name>/records`.
