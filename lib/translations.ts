import { createClient } from "./supabase/server";
import type { ArticleTranslation, ArticleTranslationRow } from "./types";
import { rowToTranslation } from "./types";

export async function getTranslationsForArticle(
  articleId: string
): Promise<ArticleTranslation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_translations")
    .select("*")
    .eq("article_id", articleId);

  if (error || !data) return [];
  return (data as ArticleTranslationRow[]).map(rowToTranslation);
}

export async function upsertTranslation(
  articleId: string,
  locale: "en" | "es",
  fields: {
    title: string;
    excerpt: string;
    content: string;
    translatedBy?: string;
    modelUsed?: string;
    status?: "draft" | "published" | "needs_review";
  }
): Promise<ArticleTranslation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_translations")
    .upsert(
      {
        article_id: articleId,
        locale,
        title: fields.title,
        excerpt: fields.excerpt,
        content: fields.content,
        translated_by: fields.translatedBy ?? "ai",
        model_used: fields.modelUsed ?? null,
        status: fields.status ?? "draft",
        translated_at: new Date().toISOString(),
      },
      { onConflict: "article_id,locale" }
    )
    .select()
    .single();

  if (error || !data) {
    console.error("upsertTranslation error:", error);
    return null;
  }
  return rowToTranslation(data as ArticleTranslationRow);
}

export async function publishTranslation(
  articleId: string,
  locale: "en" | "es"
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("article_translations")
    .update({ status: "published" })
    .eq("article_id", articleId)
    .eq("locale", locale);

  if (error) {
    console.error("publishTranslation error:", error);
    return false;
  }
  return true;
}

export async function getTranslationStatusMap(
  articleIds: string[]
): Promise<Map<string, Record<string, string>>> {
  if (articleIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_translations")
    .select("article_id, locale, status")
    .in("article_id", articleIds);

  const map = new Map<string, Record<string, string>>();
  if (data) {
    for (const row of data as { article_id: string; locale: string; status: string }[]) {
      const existing = map.get(row.article_id) ?? {};
      existing[row.locale] = row.status;
      map.set(row.article_id, existing);
    }
  }
  return map;
}
