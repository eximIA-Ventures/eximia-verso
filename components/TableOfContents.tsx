"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/mdx";
import { useLocale } from "./LocaleProvider";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={t("article.tocLabel")}>
      <h4 className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        {t("article.toc")}
      </h4>
      <ul className="space-y-1.5 border-l border-border/30">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block py-0.5 text-[13px] leading-snug transition-all ${
                item.level === 3 ? "pl-5" : "pl-3"
              } ${
                activeId === item.id
                  ? "text-accent border-l-2 border-accent -ml-px"
                  : "text-muted/60 hover:text-muted"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
