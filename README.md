# Apres-Ski 🏔️

A shared ski-chalet trip organizer. One group, one trip — countdown, who's there
each day, meals, a consolidated shopping list, and chalet logistics. No accounts:
open the link, pick a name and colour, you're in. Mobile-first PWA.

**Live:** https://apres-ski.borden.ch

## Quick start

```bash
npm install
# run PocketBase locally (see docs/development.md), then:
POCKETBASE_URL=http://localhost:8090 npm run dev
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · PocketBase · Claude (Haiku),
deployed on Coolify behind a Synology reverse proxy.

## Docs

- [PROJECT.md](./PROJECT.md) — functional spec (what it does)
- [PRODUCT.md](./PRODUCT.md) · [DESIGN.md](./DESIGN.md) — strategy & visual system
- [CLAUDE.md](./CLAUDE.md) — contributor/agent guide
- [docs/](./docs/) — architecture, development, deployment, data model, AI, design
