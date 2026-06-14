/**
 * Server-only PocketBase access. PocketBase is internal-only (no public port);
 * only Route Handlers and server actions import this. Collections use open API
 * rules, so no auth token is needed (PROJECT.md §10).
 */
const BASE = process.env.POCKETBASE_URL ?? "http://pocketbase:8090";

type Query = Record<string, string | number | undefined>;

function qs(params?: Query): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function pb<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PocketBase ${init?.method ?? "GET"} ${path} → ${res.status} ${detail}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

type ListResult<T> = { items: T[]; totalItems: number; page: number; perPage: number };

/** All records of a collection (single page; our datasets are small). */
export async function pbList<T>(collection: string, params?: Query): Promise<T[]> {
  const data = await pb<ListResult<T>>(
    `/api/collections/${collection}/records${qs({ perPage: 500, ...params })}`,
  );
  return data.items;
}

/** First record matching the query, or null. Used for single-record collections. */
export async function pbFirst<T>(collection: string, params?: Query): Promise<T | null> {
  const items = await pbList<T>(collection, { ...params, perPage: 1 });
  return items[0] ?? null;
}

export function pbGetOne<T>(collection: string, id: string): Promise<T> {
  return pb<T>(`/api/collections/${collection}/records/${id}`);
}

export function pbCreate<T>(collection: string, body: unknown): Promise<T> {
  return pb<T>(`/api/collections/${collection}/records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function pbUpdate<T>(collection: string, id: string, body: unknown): Promise<T> {
  return pb<T>(`/api/collections/${collection}/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function pbDelete(collection: string, id: string): Promise<null> {
  return pb<null>(`/api/collections/${collection}/records/${id}`, { method: "DELETE" });
}

/**
 * Upsert a single-record collection (trips, basecamp, weather): patch the
 * existing record if present, else create one.
 */
export async function pbUpsertSingle<T extends { id: string }>(
  collection: string,
  body: unknown,
): Promise<T> {
  const existing = await pbFirst<T>(collection);
  return existing
    ? pbUpdate<T>(collection, existing.id, body)
    : pbCreate<T>(collection, body);
}
