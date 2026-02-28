"use client";

import { FileSearch, ShieldCheck, GitCompareArrows, Lightbulb } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export function MethodologyStrip() {
  const { t } = useLocale();

  const steps = [
    { icon: FileSearch, label: t("method.step1") },
    { icon: ShieldCheck, label: t("method.step2") },
    { icon: GitCompareArrows, label: t("method.step3") },
    { icon: Lightbulb, label: t("method.step4") },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-6 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        {t("method.title")}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-surface/30 px-4 py-2 transition-colors hover:border-accent/30 hover:bg-accent/5">
              <step.icon size={14} className="text-accent" />
              <span className="text-xs font-medium text-muted">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block mx-2 h-px w-6 bg-border/50" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
