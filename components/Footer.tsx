"use client";

import Link from "next/link";
import { EximiaLogo } from "./EximiaLogo";
import { useLocale } from "./LocaleProvider";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <EximiaLogo size={18} className="text-accent" />
              <span className="font-display text-sm font-semibold">Verso</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                by exímIA
              </span>
            </div>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                {t("footer.nav")}
              </span>
              <Link
                href="/articles"
                className="text-muted transition-colors hover:text-primary"
              >
                {t("nav.insights")}
              </Link>
              <Link
                href="/about"
                className="text-muted transition-colors hover:text-primary"
              >
                {t("nav.manifesto")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                {t("footer.social")}
              </span>
              <Link
                href="https://www.linkedin.com/company/exim-ia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-primary"
              >
                LinkedIn
              </Link>
              <Link
                href="https://x.com/hugo_capitelli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-primary"
              >
                X / Twitter
              </Link>
              <Link
                href="https://www.instagram.com/eximia.ia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-primary"
              >
                Instagram
              </Link>
              <Link
                href="https://eximiaventures.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-primary"
              >
                Site
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/30 flex items-center justify-between">
          <p className="text-xs text-muted/60">
            &copy; {new Date().getFullYear()} exímIA. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
