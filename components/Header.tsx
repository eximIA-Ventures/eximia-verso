"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { EximiaLogoFull } from "./EximiaLogoFull";
import { useLocale } from "./LocaleProvider";

export function Header() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-bg/90 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] transition-colors group-hover:text-accent">
            Verso
          </span>
          <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-[0.15em] text-muted transition-colors group-hover:text-accent">
            by
          </span>
          <EximiaLogoFull
            height={13}
            className="hidden sm:inline-block text-muted transition-colors group-hover:text-accent"
          />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/articles"
            className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-primary hover:bg-elevated/50"
          >
            {t("nav.insights")}
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-primary hover:bg-elevated/50"
          >
            {t("nav.manifesto")}
          </Link>
          <div className="ml-2 flex items-center gap-0.5 border-l border-border/50 pl-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
