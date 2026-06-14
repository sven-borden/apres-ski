/**
 * Server-side reachability check for the internal PocketBase service.
 * Confirms the app can reach PocketBase over the Coolify network — the browser
 * never talks to PocketBase directly (PROJECT.md §10).
 */
export const dynamic = "force-dynamic";

const COLLECTIONS = ["trips", "basecamp", "participants", "attendance", "meals", "weather"];

export async function GET() {
  const base = process.env.POCKETBASE_URL ?? "http://pocketbase:8090";
  try {
    const health = await fetch(`${base}/api/health`, { cache: "no-store" });
    if (!health.ok) {
      return Response.json({ ok: false, target: base, error: `health ${health.status}` }, { status: 502 });
    }
    // Confirm the schema migration applied (open list rule → 200 per collection).
    const checks = await Promise.all(
      COLLECTIONS.map(async (c) => {
        const r = await fetch(`${base}/api/collections/${c}/records?perPage=1`, { cache: "no-store" });
        return [c, r.status] as const;
      }),
    );
    const schema = Object.fromEntries(checks);
    const schemaOk = checks.every(([, s]) => s === 200);
    return Response.json(
      { ok: schemaOk, target: base, pocketbase: await health.json().catch(() => null), schema },
      { status: schemaOk ? 200 : 502 },
    );
  } catch (err) {
    return Response.json({ ok: false, target: base, error: String(err) }, { status: 502 });
  }
}
