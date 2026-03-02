import { getAllArticles, getPillars } from "@/lib/articles";
import { ArticleFilters } from "./ArticleFilters";
import { T } from "@/components/T";
import { getServerLocale } from "@/lib/get-server-locale";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const descriptions: Record<string, string> = {
    pt: "Pesquisa verificada sobre IA aplicada a estratégia, negócios e mercados.",
    en: "Verified research on AI applied to strategy, business and markets.",
    es: "Investigación verificada sobre IA aplicada a estrategia, negocios y mercados.",
  };
  return {
    title: "Insights",
    description: descriptions[locale],
  };
}

export default async function ArticlesPage() {
  const locale = await getServerLocale();
  const articles = await getAllArticles(locale);
  const pillars = getPillars();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
          <T k="insights.label" />
        </p>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight">
          <T k="insights.title" />
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted">
          <T k="insights.description" />
        </p>
      </div>

      <ArticleFilters pillars={pillars} articles={articles} />
    </div>
  );
}
