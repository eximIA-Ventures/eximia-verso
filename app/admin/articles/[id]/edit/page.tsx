import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { ArticleRow } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, article_authors(author_id, position)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const row = data as ArticleRow & {
    article_authors?: { author_id: string; position: number }[];
  };

  const authorIds = (row.article_authors ?? [])
    .sort((a, b) => a.position - b.position)
    .map((aa) => aa.author_id);

  return (
    <ArticleForm
      mode="edit"
      initialData={{
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        pillar: row.pillar,
        tags: row.tags ?? [],
        author: row.author,
        author_ids: authorIds,
        hero_image: row.hero_image ?? "",
        reading_time: row.reading_time,
        status: row.status,
        publish_date: row.publish_date ?? "",
        featured: row.featured ?? false,
        sources: row.sources ?? [],
      }}
    />
  );
}
