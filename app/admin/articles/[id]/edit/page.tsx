import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { ArticleRow } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const row = data as ArticleRow;

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
