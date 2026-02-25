# Apres-Ski

A shared ski trip organizer for groups heading to the mountains together. Plan meals, coordinate shopping, track who's there each day, and keep chalet info handy — all from a single link, no login required.

Built as a mobile-first PWA with real-time sync, so everyone in the group stays on the same page.

![Apres-Ski Hub Dashboard](/public/images/screenshot-hub.png)

## Features

- **Hub Dashboard** — Trip countdown, live weather (Open-Meteo) with snow conditions, and daily overview at a glance
- **Meal Planning** — Assign cooks per day, describe menus, and build per-meal shopping lists
- **Smart Shopping** — Consolidated shopping list across all meals with AI-powered duplicate grouping and quantity estimation
- **Crew & Attendance** — Visual attendance timeline showing who's present each day and headcount per meal
- **Chalet Info** — Address, arrival details, and photo — everything guests need in one place
- **Offline Support** — Works without internet thanks to Firestore persistent cache; syncs when back online
- **Bilingual** — Full French/English support, with French as default
- **No Auth** — Trust-based model where users self-identify; share the app via link

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | Firebase / Firestore (client-only, real-time listeners) |
| AI | Anthropic Claude (quantity estimation, item grouping) |
| Language | TypeScript 5 (strict) |
| Hosting | Vercel |

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Firebase + Anthropic config
3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |

## Project Structure

```
app/          → Pages, API routes, global styles, PWA manifest
lib/          → Firebase config, types, hooks, actions, utilities, i18n
components/   → React components (ui, layout, providers, feature modules)
docs/         → Project documentation
public/       → Static assets (icons, images)
```

## Documentation

- [Branding Guidelines](./docs/branding.md) — color palette, typography, shape tokens, logo, PWA theming
- [Architecture & Developer Guide](./docs/architecture.md) — tech stack, data flow, hooks/actions patterns, project structure
- [Firestore Data Model](./docs/data-model.md) — collections, document schemas, indexes, security rules
