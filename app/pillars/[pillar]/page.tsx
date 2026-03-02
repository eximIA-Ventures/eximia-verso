import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getArticlesByPillar } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { PillarIcon } from "@/components/PillarIcon";
import { T } from "@/components/T";
import { getPillarById } from "@/lib/pillars-config";
import { getServerLocale } from "@/lib/get-server-locale";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ pillar: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pillar: pillarId } = await params;
  const locale = await getServerLocale();
  const pillar = getPillarById(pillarId, locale);
  if (!pillar) return {};
  return {
    title: pillar.name,
    description: pillar.description,
  };
}

export default async function PillarPage({ params }: PageProps) {
  const { pillar: pillarId } = await params;
  const locale = await getServerLocale();
  const pillar = getPillarById(pillarId, locale);
  if (!pillar) notFound();

  const articles = await getArticlesByPillar(pillarId, locale);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/articles"
        className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={12} />
        <T k="pillars.back" />
      </Link>

      <div className="mb-10">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-accent">
          <PillarIcon icon={pillar.icon} size={20} />
        </div>
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">
          {pillar.name}
        </h1>
        <p className="text-sm text-muted">{pillar.description}</p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/30 py-20 text-center">
          <p className="text-sm text-muted"><T k="pillars.empty" /></p>
        </div>
      ) : (
        <div className="space-y-1">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
