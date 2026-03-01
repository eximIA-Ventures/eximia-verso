import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/articles";
import { renderMDX, extractToc } from "@/lib/mdx";
import { ArticleLayout } from "@/components/ArticleLayout";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const url = `https://verso.eximiaventures.com.br/articles/${slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url,
      siteName: "Verso by exímIA",
      publishedTime: article.publishDate,
      authors: [article.author],
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
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const toc = extractToc(article.content);
  const content = await renderMDX(article.content);

  return (
    <ArticleLayout article={article} toc={toc}>
      {content}
    </ArticleLayout>
  );
}
