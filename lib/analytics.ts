import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "@/lib/firebase";

function log(eventName: string, params?: Record<string, string | number | boolean>) {
  const analytics = getAnalyticsInstance();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

// ── User setup ──────────────────────────────────────────────────────────
export function trackUserSetup() {
  log("sign_up", { method: "local_storage" });
}

// ── Navigation / page views ─────────────────────────────────────────────
export function trackPageView(page: string) {
  log("page_view", { page_title: page });
}

// ── Trip ────────────────────────────────────────────────────────────────
export function trackTripSaved(isNew: boolean) {
  log("trip_saved", { is_new: isNew });
}

// ── Basecamp ────────────────────────────────────────────────────────────
export function trackBasecampSaved(isNew: boolean) {
  log("basecamp_saved", { is_new: isNew });
}

// ── Crew / participants ─────────────────────────────────────────────────
export function trackCrewMemberAdded() {
  log("crew_member_added");
}

export function trackCrewMemberEdited() {
  log("crew_member_edited");
}

// ── Attendance ──────────────────────────────────────────────────────────
export function trackAttendanceToggled(markedPresent: boolean) {
  log("attendance_toggled", { marked_present: markedPresent });
}

// ── Meals / dinner ──────────────────────────────────────────────────────
export function trackDinnerSaved(chefCount: number) {
  log("dinner_saved", { chef_count: chefCount });
}

// ── Shopping list ───────────────────────────────────────────────────────
export function trackShoppingItemAdded() {
  log("shopping_item_added");
}

export function trackShoppingItemToggled(checked: boolean) {
  log("shopping_item_toggled", { checked });
}

export function trackShoppingItemRemoved() {
  log("shopping_item_removed");
}

export function trackQuantitiesEstimated(itemCount: number) {
  log("quantities_estimated", { item_count: itemCount });
}

export function trackQuantitiesReset() {
  log("quantities_reset");
}

// ── Consolidated shopping ───────────────────────────────────────────────
export function trackSmartMerge(itemCount: number) {
  log("smart_merge", { item_count: itemCount });
}

export function trackConsolidatedToggle(checked: boolean, sourceCount: number) {
  log("consolidated_toggle", { checked, source_count: sourceCount });
}

// ── Weather ─────────────────────────────────────────────────────────────
export function trackWeatherRefreshed() {
  log("weather_refreshed");
}
