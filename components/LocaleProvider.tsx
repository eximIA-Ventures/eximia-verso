"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "pt",
  setLocale: () => {},
  t: (key) => key,
});

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
}

export function LocaleProvider({ children, initialLocale = "pt" }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = localStorage.getItem("verso-locale") as Locale | null;
    if (saved && ["pt", "en", "es"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("verso-locale", newLocale);
    setCookie("verso-locale", newLocale);
    document.documentElement.lang = newLocale === "pt" ? "pt-BR" : newLocale;
    // Reload so server components re-render with new locale
    window.location.reload();
  }, []);

  // Sync cookie on mount (in case localStorage has value but cookie doesn't)
  useEffect(() => {
    setCookie("verso-locale", locale);
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey) => translate(locale, key),
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
