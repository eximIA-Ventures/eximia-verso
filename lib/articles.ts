import { createClient } from "./supabase/server";
import type { Article, ArticleMeta, ArticleRow, Author, AuthorRow } from "./types";
import type { Locale } from "./i18n";
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

type TranslationLocale = "en" | "es";

interface TranslationOverlay {
  title: string;
  excerpt: string;
  content: string;
  status: string;
}

async function getTranslationMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  articleIds: string[],
  locale: TranslationLocale
): Promise<Map<string, TranslationOverlay>> {
  if (articleIds.length === 0) return new Map();
  const { data } = await supabase
    .from("article_translations")
    .select("article_id, title, excerpt, content, status")
    .eq("locale", locale)
    .eq("status", "published")
    .in("article_id", articleIds);

  const map = new Map<string, TranslationOverlay>();
  if (data) {
    for (const row of data) {
      map.set(row.article_id, row as TranslationOverlay);
    }
  }
  return map;
}

function applyTranslation(
  meta: ArticleMeta,
  translation: TranslationOverlay | undefined
): ArticleMeta {
  if (!translation) return { ...meta, isTranslated: false };
  return {
    ...meta,
    title: translation.title,
    excerpt: translation.excerpt,
    isTranslated: true,
  };
}

function applyTranslationFull(
  article: Article,
  translation: TranslationOverlay | undefined
): Article {
  if (!translation) return { ...article, isTranslated: false };
  return {
    ...article,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    isTranslated: true,
  };
}

export async function getAllArticles(locale: Locale = "pt"): Promise<ArticleMeta[]> {
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

  const rows = data as ArticleWithAuthors[];
  const metas = rows.map((row) => rowToMeta(row, extractAuthors(row)));

  if (locale === "pt") return metas;

  const ids = rows.map((r) => r.id);
  const translations = await getTranslationMap(supabase, ids, locale as TranslationLocale);

  return metas.map((meta, i) => applyTranslation(meta, translations.get(rows[i].id)));
}

export async function getArticleBySlug(slug: string, locale: Locale = "pt"): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, article_authors(role, position, authors(*))")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  const row = data as ArticleWithAuthors;
  const article = rowToArticle(row, extractAuthors(row));

  if (locale === "pt") return article;

  const translations = await getTranslationMap(supabase, [row.id], locale as TranslationLocale);
  return applyTranslationFull(article, translations.get(row.id));
}

export async function getArticlesByPillar(pillar: string, locale: Locale = "pt"): Promise<ArticleMeta[]> {
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

  const rows = data as ArticleWithAuthors[];
  const metas = rows.map((row) => rowToMeta(row, extractAuthors(row)));

  if (locale === "pt") return metas;

  const ids = rows.map((r) => r.id);
  const translations = await getTranslationMap(supabase, ids, locale as TranslationLocale);

  return metas.map((meta, i) => applyTranslation(meta, translations.get(rows[i].id)));
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

export async function getFeaturedArticle(locale: Locale = "pt"): Promise<ArticleMeta | null> {
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
  const meta = rowToMeta(row, extractAuthors(row));

  if (locale === "pt") return meta;

  const translations = await getTranslationMap(supabase, [row.id], locale as TranslationLocale);
  return applyTranslation(meta, translations.get(row.id));
}

import { PILLARS } from "./pillars-config";
export function getPillars() {
  return PILLARS;
}
