"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export function NewsletterSignup() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 409) {
        setStatus("duplicate");
      } else if (!res.ok) {
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/20 bg-accent/5 px-6 py-12 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Check size={18} className="text-accent" />
        </div>
        <p className="font-display text-lg font-semibold">{t("newsletter.success")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-surface/50 px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
          {t("newsletter.tagline")}
        </p>
        <h2 className="mb-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("newsletter.title")}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          {t("newsletter.description")}
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 sm:flex-row flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error" || status === "duplicate") setStatus("idle");
            }}
            placeholder={t("newsletter.placeholder")}
            required
            className="flex-1 rounded-lg border border-border/50 bg-bg/50 px-4 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                {t("newsletter.cta")}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">{t("newsletter.error")}</p>
        )}
        {status === "duplicate" && (
          <p className="mt-3 text-xs text-accent">{t("newsletter.duplicate")}</p>
        )}
      </div>
    </div>
  );
}
