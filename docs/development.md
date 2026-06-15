# Development

## Prerequisites

- Node 20+ (CI/prod build uses Node 24)
- Docker (only needed to run PocketBase locally)

## Install & run

```bash
npm install
npm run dev      # http://localhost:3000
```

Without a PocketBase reachable at `POCKETBASE_URL`, the data reads fail and the
app shows empty/loading states. To work on data-backed screens, run PB locally.

## Run PocketBase locally

The repo builds its own PB image (binary + baked schema migration + hooks):

```bash
docker build -t apres-pb:local ./pocketbase
docker run -d --name apb -p 8090:8090 \
  -e PB_SUPERUSER_EMAIL=dev@example.com \
  -e PB_SUPERUSER_PASSWORD=devpassword123 \
  apres-pb:local

# point the dev server at it
POCKETBASE_URL=http://localhost:8090 npm run dev
```

`GET http://localhost:3000/api/health/db` confirms reachability + that all six
collections exist. PocketBase admin UI: `http://localhost:8090/_/`
(login with the superuser env above).

Seed a trip quickly (the UI also does this — creating a trip seeds meals):

```bash
curl -s -X POST http://localhost:8090/api/collections/trips/records \
  -H "Content-Type: application/json" \
  -d '{"name":"Verbier 2026","startDate":"2026-06-24","endDate":"2026-06-27"}'
```

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config; `.claude/` and `pocketbase/` are ignored) |

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `POCKETBASE_URL` | server | PB base URL. Default `http://pocketbase:8090` (compose service name) |
| `ANTHROPIC_API_KEY` | server | Claude key for `/api/ai/*`. Absent/invalid → endpoints 502 → client toast + local fallback |
| `ANTHROPIC_MODEL` | server | Claude model. Code default `claude-opus-4-8`; **prod uses `claude-haiku-4-5`** |
| `AI_API_TOKEN` | server | Optional. If set, `/api/ai/*` require `Authorization: Bearer <token>` |

All are server-only — none are `NEXT_PUBLIC_*`; the browser never sees them.

## Verifying changes in the real app

There's no test suite. Validate UI changes by running the app and driving it in a
browser (the local-PB setup above gives you a full live data loop). The
`/verify` and `/run` skills automate launching + screenshotting.

## Conventions

- Match the surrounding code's style (Tailwind utility classes, OKLCH tokens, FR
  copy — French is the default locale).
- New screens: thin `app/<route>/page.tsx` that renders a client component from
  `components/<area>/`.
- Reads via hooks (`lib/hooks/data.ts`), writes via server actions
  (`lib/actions.ts`). Don't fetch PocketBase from a client component.
- Keep dates as `YYYY-MM-DD` strings; use `lib/trip-utils.ts` helpers.
