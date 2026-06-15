# CLAUDE.md

Guidance for working in this repo. Read the linked `docs/*.md` before deep work
in an area — this file is the index, not the full story.

## What this is

**Apres-Ski** — a shared ski-chalet trip organizer. One trip, one group, no
accounts, mobile-first PWA. Live at https://apres-ski.borden.ch.
Functional spec: [PROJECT.md](./PROJECT.md). Strategy: [PRODUCT.md](./PRODUCT.md).

Five screens: **Hub** (`/`), **Crew** (`/crew`), **Feasts** (`/feasts`),
**Shopping** (`/shopping`), **Basecamp** (`/basecamp`).

## Stack & layout

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (OKLCH tokens) ·
PocketBase (internal) · Claude/Haiku (optional AI). Source map + data flow +
invariants → **[docs/architecture.md](./docs/architecture.md)**.

## Commands

```bash
npm run dev      # dev server (needs POCKETBASE_URL; run PB locally — see below)
npm run build    # prod build + typecheck
npm run lint     # eslint
```

Local PocketBase, env vars, and how to verify changes in the running app →
**[docs/development.md](./docs/development.md)**. There is no test suite — verify
by driving the live app in a browser.

## Conventions (do these)

- **Reads via hooks** (`lib/hooks/data.ts`, polled), **writes via server actions**
  (`lib/actions.ts`, `"use server"`). The browser never touches PocketBase or
  Anthropic — always proxy through `/api/*`.
- New screen = thin `app/<route>/page.tsx` rendering a client component in
  `components/<area>/`.
- **Dates are timezone-free `YYYY-MM-DD` strings** — use `lib/trip-utils.ts`,
  never local `Date`/`toISOString` (it shifts a day in +offset TZs).
- French copy by default. Use OKLCH token utilities (`bg-surface`, `text-ink`,
  `text-accent-ink`, …) and the shared primitives (`Button`, `Modal`, `Avatar`,
  `Toast`, `Field`…). Design rules → **[docs/design.md](./docs/design.md)**.
- Commit/push/deploy only when asked. Push to `main` auto-deploys to prod.

## Gotchas (have bitten us)

- PocketBase base collections have **no system `created`/`updated`** field
  (custom `createdAt`/`updatedAt`) → don't `sort:"-created"` (400).
- PocketBase **JS migrations need a hooks dir** to run (`--hooksDir`); the PB
  image handles it.
- Anthropic **`output_config.effort` 400s on Haiku** — don't pass it.
- Coolify **compose domain mapping** is `docker_compose_domains`, not the resource
  `fqdn`, and must be set after a deploy parses the compose.

## Subsystems → docs

| Area | Doc |
|---|---|
| Architecture, data flow, source layout | [docs/architecture.md](./docs/architecture.md) |
| Local dev, env vars, scripts | [docs/development.md](./docs/development.md) |
| PocketBase schema & collections | [docs/data-model.md](./docs/data-model.md) |
| AI endpoints (estimate / smart-merge) | [docs/ai.md](./docs/ai.md) |
| Coolify + Synology + PocketBase deploy | [docs/deployment.md](./docs/deployment.md) |
| Design tokens, typography, primitives | [docs/design.md](./docs/design.md) |
