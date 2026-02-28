"use client";

import { useLocale } from "./LocaleProvider";

const LOCALE_MAP: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

interface LocaleDateProps {
  dateStr: string;
  format?: "short" | "long";
}

export function LocaleDate({ dateStr, format = "short" }: LocaleDateProps) {
  const { locale } = useLocale();
  const dateLocale = LOCALE_MAP[locale] ?? "pt-BR";

  const formatted = new Date(dateStr).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
  });

  return <>{formatted}</>;
}
