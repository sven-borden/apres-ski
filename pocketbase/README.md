# PocketBase (Apres-ski datastore)

PocketBase replaces Firestore as the backend (issue #125, `coolify-migration`).
Single Go binary + SQLite, deployed on Coolify with a persistent volume.

## Contents

| File                      | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `Dockerfile`              | Pinned PocketBase binary + baked-in schema migrations.       |
| `docker-compose.yml`      | Coolify service definition (build + persistent `pb_data`).   |
| `pb_migrations/*.js`      | Schema (collections, fields, rules, indexes). Auto-applied.  |

## Schema

Collections mirror the old Firestore model. Defined in
`pb_migrations/1718323200_init_apres_ski_schema.js`, applied automatically on
container start.

| Collection     | Notes                                                              |
| -------------- | ------------------------------------------------------------------ |
| `trips`        | Single record. Client pins id `current`.                           |
| `basecamp`     | Single record. Client pins id `current`.                           |
| `participants` | One record per crew member.                                        |
| `attendance`   | Unique index `(participantId, date)` (was id `{participantId}_{date}`). |
| `meals`        | Unique index `(date)` (was id `YYYY-MM-DD`). `shoppingList` = JSON. |
| `weather`      | Single record. Client pins id `la-tzoumaz`.                        |

Design notes:

- **API rules**: all collections are open read/write (`listRule`..`deleteRule`
  = `""`), matching the trust-based no-auth model. `""` = public; `null` =
  admin-only.
- **Dates**: date-only fields (`startDate`, `endDate`, attendance/meal `date`)
  stay `text` (`YYYY-MM-DD`) to avoid timezone drift — same as the Firestore
  strings. Timestamp fields (`createdAt`, `updatedAt`, `joinedAt`, `fetchedAt`)
  → `autodate`.
- **References** (`attendance.participantId`, `meals.responsibleIds`) stay
  denormalized text/json, not relations — same loose model as Firestore.

## Deploy on Coolify

Provisioning needs `COOLIFY_ACCESS_TOKEN` set so the Coolify MCP / API can
authenticate against `https://coolify.borden.ch`:

```bash
export COOLIFY_ACCESS_TOKEN=<token>   # or add to .env.local + restart Claude
```

Then either:

1. **Coolify UI** — New Resource → Docker Compose → point at this repo subdir
   (`pocketbase/`). Coolify builds the Dockerfile, mounts the `pb_data` volume,
   assigns a domain. Migrations apply on first boot.
2. **MCP / API** — create a compose service with this `docker-compose.yml` and
   `instant_deploy`.

### First boot

PocketBase needs a superuser for the admin UI (`/_/`). Create one once the
container is up:

```bash
# inside the container / via Coolify terminal
/pb/pocketbase superuser upsert <email> <password> --dir=/pb_data
```

Schema is already applied by the migration — no manual collection setup needed.

## Local dev

```bash
docker compose up --build
# admin UI: http://localhost:8090/_/   (run superuser upsert first)
# REST API: http://localhost:8090/api/
```
