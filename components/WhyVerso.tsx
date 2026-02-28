"use client";

import { Search, Target, Compass } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export function WhyVerso() {
  const { t } = useLocale();

  const pillars = [
    {
      icon: Search,
      title: t("why.research.title"),
      description: t("why.research.description"),
    },
    {
      icon: Target,
      title: t("why.decision.title"),
      description: t("why.decision.description"),
    },
    {
      icon: Compass,
      title: t("why.territory.title"),
      description: t("why.territory.description"),
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="mb-8 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        {t("why.title")}
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-xl border border-border/50 bg-surface/30 p-6 transition-colors hover:border-border hover:bg-surface/50"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <pillar.icon size={16} />
            </div>
            <h3 className="mb-2 font-display text-sm font-semibold tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
