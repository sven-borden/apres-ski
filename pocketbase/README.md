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

## Deployment (live)

Provisioned on Coolify (`https://coolify.borden.ch`) in project **Apres-ski**,
server `localhost`, as a Dockerfile application built from this repo
(`base directory /pocketbase`). Status: `running:healthy`.

**Internal-only — no public domain.** PocketBase is *not* exposed to the
internet. It listens on `:8090` on the shared `coolify` docker network and is
reached only by the Next.js app (deployed at `apres-ski.borden.ch`), which
proxies all reads/writes/realtime server-side. The browser never talks to
PocketBase directly. Internal URL for the app: `http://<pb-container>:8090`
(container name confirmed when wiring the app — issues #126/#127/#128).

Provisioning needs `COOLIFY_ACCESS_TOKEN` set so the Coolify MCP / API can
authenticate:

```bash
export COOLIFY_ACCESS_TOKEN=<token>   # or add to .env.local + restart Claude
```

To re-create from scratch: Coolify UI → New Resource → from the
`sven-borden/apres-ski` repo, build pack Dockerfile, base dir `/pocketbase`,
add a persistent volume at `/pb_data`, and **leave the domain empty** so it
stays internal. Migrations apply automatically on first boot.

### First boot

PocketBase needs a superuser for the admin UI (`/_/`). Since the service is
internal-only, create it from the Coolify container terminal (the admin UI
isn't publicly reachable):

```bash
# Coolify → pocketbase app → Terminal
/pb/pocketbase superuser upsert <email> <password> --dir=/pb_data
```

Schema is already applied by the migration — no manual collection setup needed.

## Local dev

```bash
docker compose up --build
# admin UI: http://localhost:8090/_/   (run superuser upsert first)
# REST API: http://localhost:8090/api/
```
