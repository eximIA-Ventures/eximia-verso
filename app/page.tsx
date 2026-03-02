import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllArticles, getFeaturedArticle } from "@/lib/articles";
import { ArticleCard, FeaturedArticleCard } from "@/components/ArticleCard";
import { PillarIcon } from "@/components/PillarIcon";
import { T } from "@/components/T";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { WhyVerso } from "@/components/WhyVerso";
import { MethodologyStrip } from "@/components/MethodologyStrip";
import { getServerLocale } from "@/lib/get-server-locale";
import { getPillarName } from "@/lib/pillars-config";
import { PILLARS } from "@/lib/pillars-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getServerLocale();
  const articles = await getAllArticles(locale);
  const featuredArticle = await getFeaturedArticle(locale);
  const featured = featuredArticle ?? articles[0];
  const recent = articles.filter((a) => a.slug !== featured?.slug).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-12 sm:pt-28 sm:pb-16">
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
            <T k="hero.tagline" />
          </p>
          <h1 className="mb-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <T k="hero.title.line1" />
            <br />
            <span className="text-accent"><T k="hero.title.line2" /></span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            <T k="hero.subtitle" />
          </p>

          {/* Pillar pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={`/pillars/${pillar.id}`}
                className="flex items-center gap-1.5 rounded-full border border-border/50 px-3.5 py-1.5 text-xs text-muted transition-all hover:border-accent/30 hover:text-accent hover:bg-accent/5"
              >
                <PillarIcon icon={pillar.icon} size={12} />
                {getPillarName(pillar.id, locale)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              <T k="insights.featured" />
            </h2>
          </div>
          <FeaturedArticleCard article={featured} />
        </section>
      )}

      {/* Newsletter Signup — mid-page */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <NewsletterSignup />
      </section>

      {/* Recent Articles Grid */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
              <T k="insights.recent" />
            </h2>
            {articles.length > 7 && (
              <Link
                href="/articles"
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <T k="insights.viewAll" /> <ArrowRight size={12} />
              </Link>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Why Verso — value proposition */}
      <WhyVerso />

      {/* Methodology Strip */}
      <MethodologyStrip />

      {/* Newsletter Signup — bottom repeat */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <NewsletterSignup />
      </section>

      {/* Empty state */}
      {articles.length === 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-xl border border-dashed border-border bg-surface/30 py-24 text-center">
            <p className="text-sm text-muted">
              <T k="insights.empty.default" />
            </p>
          </div>
        </section>
      )}
    </>
  );
}
