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

// Prevent infinite refresh_token retry loops (429/400 → clear session)
function createFetchWithRetryLimit() {
  let refreshFailCount = 0;
  const MAX_REFRESH_FAILURES = 3;

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const isRefreshRequest = url.includes("/auth/v1/token") && url.includes("grant_type=refresh_token");

    const response = await fetch(input, init);

    if (isRefreshRequest) {
      if (response.status === 429 || response.status === 400) {
        refreshFailCount++;
        if (refreshFailCount >= MAX_REFRESH_FAILURES) {
          // Break the loop: clear corrupted session data
          if (typeof window !== "undefined") {
            const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
              /https:\/\/([^.]+)\./
            )?.[1];
            if (projectId) {
              Object.keys(localStorage).forEach((key) => {
                if (key.includes(projectId) || key.startsWith("sb-")) {
                  localStorage.removeItem(key);
                }
              });
            }
            console.warn(
              "[Verso] Session refresh failed %d times. Cleared corrupted session — please log in again.",
              refreshFailCount
            );
            refreshFailCount = 0;
            window.location.href = "/admin/login";
          }
        }
      } else if (response.ok) {
        refreshFailCount = 0;
      }
    }

    return response;
  };
}
