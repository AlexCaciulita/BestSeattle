/**
 * Analytics tracking for the Near Me feature.
 * Fires events to /api/nearby/track for server-side storage.
 */

type TrackEvent = {
  event: string;
  session_id?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  item_id?: number;
  item_type?: string;
  category?: string;
  position?: number;
  sponsored?: boolean;
  affiliate?: boolean;
  filter_key?: string;
  filter_value?: string;
};

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId =
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("bis_session")) ||
    `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("bis_session", sessionId);
  }
  return sessionId;
}

function track(data: TrackEvent): void {
  const payload = { ...data, session_id: getSessionId(), ts: new Date().toISOString() };

  // Use sendBeacon for reliability, fall back to fetch
  const body = JSON.stringify(payload);
  if (typeof navigator?.sendBeacon === "function") {
    navigator.sendBeacon("/api/nearby/track", body);
  } else {
    fetch("/api/nearby/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackLocationRequested() {
  track({ event: "location_permission_requested" });
}

export function trackLocationGranted(lat: number, lng: number) {
  track({ event: "location_permission_granted", lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 });
}

export function trackLocationDenied() {
  track({ event: "location_permission_denied" });
}

export function trackFilterChanged(key: string, value: string) {
  track({ event: "filter_changed", filter_key: key, filter_value: value });
}

export function trackMarkerClicked(itemId: number, category?: string, sponsored?: boolean) {
  track({ event: "marker_clicked", item_id: itemId, category, sponsored });
}

export function trackListItemClicked(itemId: number, position: number, category?: string, sponsored?: boolean) {
  track({ event: "list_item_clicked", item_id: itemId, position, category, sponsored });
}

export function trackCtaClicked(itemId: number, affiliate: boolean, sponsored: boolean) {
  track({ event: "cta_clicked", item_id: itemId, affiliate, sponsored });
}

export function trackMapMoved() {
  track({ event: "map_moved" });
}

export function trackSearchThisArea(lat: number, lng: number) {
  track({ event: "search_this_area_clicked", lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 });
}
