/**
 * Server-side reachability check for the internal PocketBase service.
 * Confirms the app can reach PocketBase over the Coolify network — the browser
 * never talks to PocketBase directly (PROJECT.md §10).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.POCKETBASE_URL ?? "http://pocketbase:8090";
  try {
    const res = await fetch(`${base}/api/health`, { cache: "no-store" });
    const body = await res.json().catch(() => null);
    return Response.json(
      { ok: res.ok, target: base, pocketbase: body },
      { status: res.ok ? 200 : 502 },
    );
  } catch (err) {
    return Response.json(
      { ok: false, target: base, error: String(err) },
      { status: 502 },
    );
  }
}
