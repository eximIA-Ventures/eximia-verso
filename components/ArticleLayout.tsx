import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { PillarBadge } from "./PillarBadge";
import { TableOfContents } from "./TableOfContents";
import { ShareButton } from "./ShareButton";
import { ReadingProgress } from "./ReadingProgress";
import { LocaleDate } from "./LocaleDate";
import { T } from "./T";
import type { Article } from "@/lib/types";
import type { TocItem } from "@/lib/mdx";

interface ArticleLayoutProps {
  article: Article;
  toc: TocItem[];
  children: React.ReactNode;
}

export function ArticleLayout({ article, toc, children }: ArticleLayoutProps) {

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <header className="mx-auto max-w-3xl pt-12 pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <PillarBadge pillar={article.pillar} />
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar size={12} />
              <LocaleDate dateStr={article.publishDate} format="long" />
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Clock size={12} />
              {article.readingTime} <T k="article.min" />
            </span>
            <ShareButton title={article.title} slug={article.slug} />
          </div>

          <h1 className="mb-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>

          <p className="text-lg leading-relaxed text-muted">
            {article.excerpt}
          </p>
        </header>

        {/* Hero Image — full width, Medium style */}
        {article.heroImage ? (
          <div className="mx-auto max-w-4xl mb-10">
            <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-elevated">
              <Image
                src={article.heroImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </div>
        )}

        {/* Body with ToC */}
        <div className="relative mx-auto max-w-3xl py-10 lg:max-w-none lg:grid lg:grid-cols-[1fr_180px] lg:gap-16">
          <div className="prose prose-lg mx-auto max-w-3xl lg:mx-0">
            {children}
          </div>

          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <TableOfContents items={toc} />
              </div>
            </aside>
          )}
        </div>

        {/* Footer */}
        <footer className="mx-auto max-w-3xl border-t border-border/30 py-10">
          {article.sources && article.sources.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                <T k="article.sources" />
              </h3>
              <ul className="space-y-1.5">
                {article.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent/80 transition-colors hover:text-accent hover:underline"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ShareButton title={article.title} slug={article.slug} />

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/50 px-3 py-1 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      </article>
    </>
  );
}
