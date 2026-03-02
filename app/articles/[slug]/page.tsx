import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/articles";
import { renderMDX, extractToc } from "@/lib/mdx";
import { ArticleLayout } from "@/components/ArticleLayout";
import { getServerLocale } from "@/lib/get-server-locale";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};

  const url = `https://verso.eximiaventures.com.br/articles/${slug}`;

  const authorNames = article.authors.length > 0
    ? article.authors.map((a) => a.name)
    : [article.author];

  const ogLocales: Record<string, string> = {
    pt: "pt_BR",
    en: "en_US",
    es: "es_ES",
  };

  return {
    title: article.title,
    description: article.excerpt,
    authors: authorNames.map((name) => ({ name })),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url,
      locale: ogLocales[locale],
      siteName: "Verso by exímIA",
      publishedTime: article.publishDate,
      authors: authorNames,
      ...(article.heroImage
        ? { images: [{ url: article.heroImage, width: 1200, height: 630, alt: article.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      ...(article.heroImage ? { images: [article.heroImage] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const toc = extractToc(article.content);
  const content = await renderMDX(article.content);

  return (
    <ArticleLayout article={article} toc={toc} locale={locale}>
      {content}
    </ArticleLayout>
  );
}
