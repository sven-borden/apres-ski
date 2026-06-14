import "server-only";
import PocketBase from "pocketbase";

// PocketBase is internal-only (not reachable from the browser). All access
// goes through this server-side client. POCKETBASE_URL is the internal URL,
// e.g. http://<pb-container>:8090 on the coolify network (http://localhost:8090
// for local dev). Collections use open rules, so no auth is needed.

export function getPb(): PocketBase {
  const url = process.env.POCKETBASE_URL;
  if (!url) {
    throw new Error("Missing POCKETBASE_URL environment variable");
  }
  const pb = new PocketBase(url);
  // Server handles concurrent requests; disable the SDK's auto-cancellation
  // that would otherwise abort parallel calls sharing a request key.
  pb.autoCancellation(false);
  return pb;
}

export const TRIP_ID = "current";
export const TRIP_DOC_ID = "current";
export const BASECAMP_DOC_ID = "current";
export const WEATHER_DOC_ID = "la-tzoumaz";
