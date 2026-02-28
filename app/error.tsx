"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error("[Verso]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
        {t("error.label")}
      </p>
      <h1 className="mb-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {t("error.title")}
      </h1>
      <p className="mb-8 text-sm text-muted leading-relaxed max-w-md mx-auto">
        {t("error.description")}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-border/50 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-accent"
        >
          <RefreshCw size={14} />
          {t("error.retry")}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border/50 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-accent"
        >
          <ArrowLeft size={14} />
          {t("error.back")}
        </Link>
      </div>
    </div>
  );
}
