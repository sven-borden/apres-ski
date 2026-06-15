/**
 * Abuse controls shared by the AI endpoints (PROJECT.md §6.3): per-IP rate
 * limit (~1 req / 12s, ~50 / day, daily reset at UTC midnight), optional bearer
 * token, and a geo-restriction to Switzerland + bordering countries.
 */

const ALLOWED_COUNTRIES = new Set(["CH", "FR", "DE", "AT", "IT", "LI"]);

type Bucket = { last: number; dayStart: number; dayCount: number };
const buckets = new Map<string, Bucket>();

function utcDayStart(now: number): number {
  return Math.floor(now / 86_400_000);
}

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function geoAllowed(req: Request): boolean {
  const country = (
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("x-country") ??
    ""
  ).toUpperCase();
  // No detectable country (e.g. local dev, no geo header) is allowed through.
  return country === "" || ALLOWED_COUNTRIES.has(country);
}

function rateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const today = utcDayStart(now);
  const b = buckets.get(ip) ?? { last: 0, dayStart: today, dayCount: 0 };
  if (b.dayStart !== today) {
    b.dayStart = today;
    b.dayCount = 0;
  }
  if (now - b.last < 12_000) {
    buckets.set(ip, b);
    return { ok: false, retryAfter: Math.ceil((12_000 - (now - b.last)) / 1000) };
  }
  if (b.dayCount >= 50) {
    buckets.set(ip, b);
    return { ok: false, retryAfter: 3600 };
  }
  b.last = now;
  b.dayCount += 1;
  buckets.set(ip, b);
  return { ok: true };
}

/** Returns a Response to short-circuit with, or null to proceed. */
export function guard(req: Request): Response | null {
  if (!geoAllowed(req)) {
    return Response.json({ error: "Service indisponible dans ta région." }, { status: 403 });
  }
  const token = process.env.AI_API_TOKEN;
  if (token && req.headers.get("authorization") !== `Bearer ${token}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  const rl = rateLimit(getIp(req));
  if (!rl.ok) {
    return Response.json(
      { error: "Trop de requêtes — réessaie dans un instant." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }
  return null;
}
