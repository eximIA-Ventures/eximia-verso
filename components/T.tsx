"use client";

import { useLocale } from "./LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

export function T({ k }: { k: TranslationKey }) {
  const { t } = useLocale();
  return <>{t(k)}</>;
}
