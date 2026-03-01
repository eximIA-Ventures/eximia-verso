import { createClient } from "./supabase/server";
import type { Article, ArticleMeta, ArticleRow, Author, AuthorRow } from "./types";
import { rowToArticle, rowToMeta, rowToAuthor } from "./types";

interface ArticleWithAuthors extends ArticleRow {
  article_authors: {
    role: string;
    position: number;
    authors: AuthorRow;
  }[];
}

function extractAuthors(row: ArticleWithAuthors): Author[] {
  if (!row.article_authors) return [];
  return row.article_authors
    .sort((a, b) => a.position - b.position)
    .map((aa) => rowToAuthor(aa.authors));
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_authors(role, position, authors(*))")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("getAllArticles error:", error);
    return [];
  }

  return (data as ArticleWithAuthors[]).map((row) =>
    rowToMeta(row, extractAuthors(row))
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_authors(role, position, authors(*))")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  const row = data as ArticleWithAuthors;
  return rowToArticle(row, extractAuthors(row));
}

export async function getArticlesByPillar(pillar: string): Promise<ArticleMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_authors(role, position, authors(*))")
    .eq("status", "published")
    .eq("pillar", pillar)
    .order("publish_date", { ascending: false });

  if (error) {
    console.error("getArticlesByPillar error:", error);
    return [];
  }

  return (data as ArticleWithAuthors[]).map((row) =>
    rowToMeta(row, extractAuthors(row))
  );
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
    .select("*, article_authors(role, position, authors(*))")
    .eq("status", "published")
    .eq("featured", true)
    .order("publish_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ArticleWithAuthors;
  return rowToMeta(row, extractAuthors(row));
}

import { PILLARS } from "./pillars-config";
export function getPillars() {
  return PILLARS;
}
