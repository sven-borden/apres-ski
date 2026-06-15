# AI features

Two optional conveniences (PROJECT.md §6), both **server-side**, rate-limited,
and degrade gracefully — the app is fully usable without them.

| Endpoint | Purpose | Spec |
|---|---|---|
| `POST /api/ai/estimate` | Estimate grocery quantities for a shopping list given headcount + menu | §6.1 |
| `POST /api/ai/merge` | "Smart Merge": dedupe/group a multilingual list under canonical names + grocery categories in aisle order | §6.2 |

Implementation: `lib/ai/anthropic.ts` (Claude via `@anthropic-ai/sdk`),
`lib/server/guard.ts` (abuse controls), routes under `src/app/api/ai/`.

## Model

`ANTHROPIC_MODEL` (default `claude-opus-4-8` in code; **prod uses
`claude-haiku-4-5`** — plenty for this extraction work, ~5× cheaper/faster).
`ANTHROPIC_API_KEY` is server-only.

Prompts ask for strict JSON; the server **validates and sanitizes** the output
(units restricted to the closed set `kg, g, L, dL, cl, pcs, bottles, packs`;
unknown ids/units dropped). Do **not** pass `output_config.effort` — it 400s on
Haiku.

## Abuse controls (`lib/server/guard.ts`, §6.3)

- **Per-IP rate limit**: ~1 request / 12 s and ≤ 50 / day (resets at UTC
  midnight). Over-limit → `429` with `retry-after`.
- **Geo restriction**: served only to CH + bordering countries (CH, FR, DE, AT,
  IT, LI), read from a `cf-ipcountry` / `x-vercel-ip-country` / `x-country`
  header. **No country header → allowed** (local dev, or no geo at the proxy).
- **Optional bearer**: if `AI_API_TOKEN` is set, requests must carry
  `Authorization: Bearer <token>`.

## Graceful degradation + toast

The client calls these endpoints and, on **any** failure (no key, 401, 429,
502, network), shows a **toast** (`components/toast.tsx`) and falls back to a
local heuristic (`estimateQuantities` / `smartMerge`). So the buttons always do
something.

With a dummy/absent `ANTHROPIC_API_KEY`, the endpoints return `502` and the
toast fires — set a real key to enable Claude.
