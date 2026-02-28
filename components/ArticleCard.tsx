import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import { PillarBadge } from "./PillarBadge";
import { PillarIcon } from "./PillarIcon";
import { ShareButton } from "./ShareButton";
import { LocaleDate } from "./LocaleDate";
import { T } from "./T";
import { getPillarById } from "@/lib/pillars-config";
import type { ArticleMeta } from "@/lib/types";

export function ArticleCard({ article }: { article: ArticleMeta }) {
  const pillarData = getPillarById(article.pillar);

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border/50 bg-surface/50 transition-all hover:border-border hover:bg-surface hover:shadow-lg hover:shadow-black/5">
        {/* Image area */}
        <div className="relative aspect-[16/9] overflow-hidden bg-elevated">
          {article.heroImage ? (
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted/10">
                {pillarData && <PillarIcon icon={pillarData.icon} size={48} />}
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <PillarBadge pillar={article.pillar} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2.5 flex items-center gap-3 text-xs text-muted/70">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {article.readingTime} <T k="article.min" />
            </span>
            <span><LocaleDate dateStr={article.publishDate} /></span>
            <ShareButton title={article.title} slug={article.slug} className="ml-auto" />
          </div>

          <h2 className="mb-2 font-display text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
            {article.title}
          </h2>

          <p className="text-sm leading-relaxed text-muted line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function FeaturedArticleCard({ article }: { article: ArticleMeta }) {
  const hasImage = !!article.heroImage;
  const pillarData = getPillarById(article.pillar);

  if (!hasImage) {
    // Text-only featured card — no empty image block
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <article className="overflow-hidden rounded-xl border border-border/50 bg-surface/50 p-8 transition-all hover:border-accent/20 hover:bg-surface hover:shadow-xl hover:shadow-black/5 md:p-10">
          <div className="mb-4 flex items-center gap-3">
            <PillarBadge pillar={article.pillar} />
            <span className="flex items-center gap-1 text-xs text-muted/70">
              <Clock size={11} />
              {article.readingTime} <T k="article.min" />
            </span>
            <span className="text-xs text-muted/50">
              <LocaleDate dateStr={article.publishDate} />
            </span>
          </div>

          <h2 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight transition-colors group-hover:text-accent md:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h2>

          <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
            <T k="insights.read" />
            <ArrowUpRight size={14} />
          </div>
        </article>
      </Link>
    );
  }

  // Featured card with image
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border/50 bg-surface/50 transition-all hover:border-border hover:bg-surface hover:shadow-xl hover:shadow-black/5 md:grid md:grid-cols-[1.2fr_1fr] md:items-stretch">
        <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden bg-elevated">
          <Image
            src={article.heroImage!}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex items-center gap-3">
            <PillarBadge pillar={article.pillar} />
            <span className="flex items-center gap-1 text-xs text-muted/70">
              <Clock size={11} />
              {article.readingTime} <T k="article.min" />
            </span>
          </div>

          <h2 className="mb-3 font-display text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-accent md:text-3xl">
            {article.title}
          </h2>

          <p className="mb-4 text-sm leading-relaxed text-muted line-clamp-3 md:text-base">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted/50">
            <span><LocaleDate dateStr={article.publishDate} /></span>
          </div>

          <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
            <T k="insights.read" />
            <ArrowUpRight size={13} />
          </div>
        </div>
      </article>
    </Link>
  );
}
