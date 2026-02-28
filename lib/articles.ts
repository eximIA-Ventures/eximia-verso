import { createClient } from "./supabase/server";
import type { Article, ArticleMeta, ArticleRow } from "./types";
import { rowToArticle, rowToMeta } from "./types";

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("getAllArticles error:", error);
    return [];
  }

  return (data as ArticleRow[]).map(rowToMeta);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return rowToArticle(data as ArticleRow);
}

export async function getArticlesByPillar(pillar: string): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("pillar", pillar)
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("getArticlesByPillar error:", error);
    return [];
  }

  return (data as ArticleRow[]).map(rowToMeta);
}

export async function getArticleSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");

  if (error) return [];
  return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getFeaturedArticle(): Promise<ArticleMeta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("publish_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToMeta(data as ArticleRow);
}

import { PILLARS } from "./pillars-config";
export function getPillars() {
  return PILLARS;
}
