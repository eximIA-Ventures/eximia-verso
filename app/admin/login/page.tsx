"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 overflow-hidden">
      {/* Background accent blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.02] blur-[120px]" />
      </div>

      {/* Dot-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + Product Divider */}
        <div className="mb-10 flex flex-col items-center">
          <img
            src="/logo-horizontal.svg"
            alt="eximIA"
            className="h-12 filter invert-[80%] sepia-[15%] saturate-[800%] hue-rotate-[355deg] brightness-[85%] contrast-[80%]"
          />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px w-8 bg-border/60" />
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-muted">
              Verso
            </span>
            <div className="h-px w-8 bg-border/60" />
          </div>
          {/* Accent indicator bar */}
          <div
            className="h-1 w-16 mt-2 rounded-full bg-accent"
            style={{ boxShadow: "0 0 12px var(--accent)" }}
          />
        </div>

        {/* Glass Card */}
        <div className="rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl shadow-black/20">
          {/* Icon Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Lock size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">
                {t("admin.login.title")}
              </h1>
              <p className="text-xs text-muted">
                Entre para acessar o dashboard
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-primary/80"
              >
                {t("admin.login.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-primary/80"
              >
                {t("admin.login.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full h-10 items-center justify-center gap-2 rounded-lg bg-accent text-bg text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (
                t("admin.login.submitting")
              ) : (
                <>
                  {t("admin.login.submit")}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted/50">
          eximIA Verso &middot; Content platform
        </p>
      </div>
    </div>
  );
}
