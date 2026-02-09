# Apres-Ski

Collaborative ski trip planner webapp. Real-time, mobile-first, no login required.

Plan meals, track attendance, and share chalet info — all in one place.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Backend:** Firebase / Firestore (client-side only)
- **Language:** TypeScript 5 (strict)
- **Font:** Inter

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Firebase config
3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/          → Pages, global styles, PWA manifest
lib/          → Firebase config, TypeScript types, hooks, actions, utils
components/   → React components (ui, layout, providers, feature modules)
docs/         → Project documentation
public/       → Static assets (icons, images)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Documentation

- [Branding Guidelines](./docs/branding.md) — color palette, typography, shape tokens, logo, PWA theming
- [Architecture & Developer Guide](./docs/architecture.md) — tech stack, data flow, hooks/actions patterns, project structure
- [Firestore Data Model](./docs/data-model.md) — collections, document schemas, indexes, security rules
