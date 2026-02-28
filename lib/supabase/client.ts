import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        flowType: "pkce",
      },
      global: {
        fetch: createFetchWithRetryLimit(),
      },
    }
  );
}

/**
 * Clear all Supabase session data from the browser (call BEFORE creating
 * a new client when you know the session is corrupted).
 */
export function nukeSupabaseSession() {
  if (typeof window === "undefined") return;

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /https:\/\/([^.]+)\./
  )?.[1];

  // localStorage
  Object.keys(localStorage).forEach((key) => {
    if (
      (projectId && key.includes(projectId)) ||
      key.startsWith("sb-")
    ) {
      localStorage.removeItem(key);
    }
  });

  // Cookies — must match path AND secure attributes
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (
      (projectId && name.includes(projectId)) ||
      name.startsWith("sb-")
    ) {
      // Try multiple combinations to ensure deletion
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Lax`;
    }
  });
}

// ---------------------------------------------------------------------------
// Fetch wrapper: breaks the internal Supabase refresh → removeSession → retry
// loop by BLOCKING requests at the network level after repeated failures.
// ---------------------------------------------------------------------------
function createFetchWithRetryLimit() {
  let refreshFailCount = 0;
  let refreshBlocked = false;
  const MAX_REFRESH_FAILURES = 2;

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const isRefreshRequest =
      url.includes("/auth/v1/token") &&
      url.includes("grant_type=refresh_token");

    // ── BLOCKED: return instantly, never hit the network ──
    if (isRefreshRequest && refreshBlocked) {
      return new Response(
        JSON.stringify({
          error: "refresh_token_not_found",
          error_description: "Refresh blocked — session cleared",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(input, init);

    if (isRefreshRequest) {
      if (response.status === 429 || response.status === 400) {
        refreshFailCount++;
        if (refreshFailCount >= MAX_REFRESH_FAILURES) {
          refreshBlocked = true;
          nukeSupabaseSession();
          console.warn(
            "[Verso] Refresh blocked after %d failures. Session cleared.",
            refreshFailCount
          );
        }
      } else if (response.ok) {
        refreshFailCount = 0;
        refreshBlocked = false;
      }
    }

    return response;
  };
}
