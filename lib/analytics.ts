// Client-side analytics helpers for Verso Content Platform

const VISITOR_KEY = "verso_vid";
const SESSION_KEY = "verso_sid";

/** Stable visitor ID based on browser fingerprint hash, stored in localStorage */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(VISITOR_KEY);
  if (stored) return stored;

  const raw = [
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? "",
  ].join("|");

  // Simple djb2 hash
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  const id = `v_${hash.toString(36)}`;
  localStorage.setItem(VISITOR_KEY, id);
  return id;
}

/** Random session ID per tab, stored in sessionStorage */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const id = `s_${crypto.randomUUID()}`;
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export interface TrackEvent {
  type: "page_view" | "read_time" | "scroll_depth" | "share_click";
  articleId: string;
  value?: number;
  metadata?: Record<string, string>;
}

/** Send events to /api/track. Falls back to sendBeacon for unload scenarios. */
export function track(events: TrackEvent[], useBeacon = false): void {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  const payload = JSON.stringify({
    events: events.map((e) => ({
      ...e,
      visitorId,
      sessionId,
    })),
  });

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    return;
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Silent fail — analytics should never break UX
  });
}
