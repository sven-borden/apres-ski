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
app/          → Pages and global styles
lib/          → Firebase config, TypeScript types, hooks, actions, utils
components/   → React components (planned)
public/       → Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Roadmap

See [PLAN.md](./PLAN.md) for the full implementation roadmap.
