# Architecture

Apres-Ski is a single-trip ski-chalet organizer. One shared link, no accounts,
mobile-first PWA. See [PROJECT.md](../PROJECT.md) for the full functional spec.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with an OKLCH design-token system (see [design.md](./design.md))
- **PocketBase** (SQLite) for data — internal only, never reached from the browser
- **Anthropic Claude** (Haiku) for two optional AI conveniences
- Deployed on **Coolify** as a single docker-compose stack, fronted by a
  **Synology** reverse proxy at `https://apres-ski.borden.ch`

## Data flow

The browser never talks to PocketBase or Anthropic directly (PROJECT.md §10).
Everything is proxied server-side:

```
Browser (client components)
  │  fetch /api/db/*        (reads, polled)
  │  server actions          (writes)
  │  fetch /api/ai/*         (estimate / smart-merge)
  ▼
Next.js server (route handlers + "use server" actions)
  │  lib/pb/server.ts  → PocketBase REST (open rules, internal network)
  │  lib/ai/anthropic.ts → Claude (ANTHROPIC_API_KEY, server-only)
  ▼
PocketBase  ·  Anthropic API
```

- **Reads**: client hooks (`lib/hooks/data.ts`) poll `GET /api/db/*` every 4 s
  (weather every 5 min), pausing while the tab is hidden.
- **Writes**: server actions in `lib/actions.ts` (`"use server"`) call PocketBase.
  Components update optimistically, then a poll reconciles.
- **AI**: client posts to `/api/ai/estimate` and `/api/ai/merge`; on any failure
  it shows a toast and falls back to a local heuristic (the app stays usable).

## Source layout

```
src/
  app/
    page.tsx              Hub (/)
    crew|feasts|shopping|basecamp/page.tsx
    api/db/*/route.ts     read endpoints (one per collection)
    api/ai/{estimate,merge}/route.ts
    api/health/db/route.ts  internal PB reachability + schema check
    layout.tsx, globals.css, manifest.ts
  components/             screens + shared UI (Button, Modal, Avatar, Toast, …)
  lib/
    pb/server.ts          server-only PocketBase client
    pb/types.ts           record types
    actions.ts            "use server" writes
    hooks/                usePolled + per-resource hooks
    ai/anthropic.ts       Claude calls
    server/guard.ts       rate-limit + geo + bearer for /api/ai/*
    weather.ts            Open-Meteo refresh
    user.ts               device identity (localStorage)
    trip-utils.ts         timezone-safe date helpers
    {crew,feasts,basecamp,shopping,palette,...}.ts  types + pure logic
pocketbase/               custom PB image (binary + baked migrations + hooks)
```

## Key invariants / gotchas

- **Dates are timezone-free strings** (`YYYY-MM-DD`). Iterate with a noon-UTC
  anchor (`lib/trip-utils.ts`) — a local-midnight `toISOString()` shifts a day
  back in positive-offset timezones. This bit us once; don't reintroduce it.
- **PocketBase base collections have no system `created`/`updated`** field (we use
  custom `createdAt`/`updatedAt` autodate). Don't `sort:"-created"` → 400.
- **PocketBase JS migrations only run when the JSVM is initialised**, which needs
  a hooks dir — the image creates `/pb/pb_hooks` and passes `--hooksDir`.
- **Anthropic `output_config.effort` 400s on Haiku** — don't add it.

More: [development.md](./development.md) · [deployment.md](./deployment.md) ·
[data-model.md](./data-model.md) · [ai.md](./ai.md) · [design.md](./design.md)
