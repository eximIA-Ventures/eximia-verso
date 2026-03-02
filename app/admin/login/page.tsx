"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, nukeSupabaseSession } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: nuke any stale session data so the Supabase client
  // singleton never sees a corrupted refresh token.
  useEffect(() => {
    nukeSupabaseSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Belt-and-suspenders: clear again right before creating the client
    nukeSupabaseSession();

    const supabase = createClient();

    // Force the singleton to drop any in-memory session
    await supabase.auth.signOut({ scope: "local" });

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("admin.login.error"));
      setLoading(false);
      return;
    }

    // Full page navigation ensures cookies are sent in the next request
    window.location.href = redirect;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
            Verso Admin
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("admin.login.title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-muted">
              {t("admin.login.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs text-muted">
              {t("admin.login.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("admin.login.submitting") : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
