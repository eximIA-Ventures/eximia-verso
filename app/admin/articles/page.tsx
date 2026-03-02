"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Star, Languages } from "lucide-react";
import { PILLARS } from "@/lib/pillars-config";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  pillar: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  updated_at: string;
  article_translations?: { locale: string; status: string }[];
}

type StatusFilter = "all" | "draft" | "published" | "archived";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-400/10 text-green-400",
  draft: "bg-amber-400/10 text-amber-400",
  archived: "bg-muted/10 text-muted",
};

const TRANSLATION_BADGE: Record<string, string> = {
  published: "bg-green-400/10 text-green-400 border-green-400/20",
  draft: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  needs_review: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

export default function AdminArticlesPage() {
  const { t } = useLocale();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pillarFilter, setPillarFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/articles");
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  const counts = {
    all: articles.length,
    draft: articles.filter((a) => a.status === "draft").length,
    published: articles.filter((a) => a.status === "published").length,
    archived: articles.filter((a) => a.status === "archived").length,
  };

  const filtered = articles.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (pillarFilter && a.pillar !== pillarFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const STATUS_PILLS: { key: StatusFilter; labelKey: TranslationKey }[] = [
    { key: "all", labelKey: "admin.articles.all" },
    { key: "draft", labelKey: "admin.articles.drafts" },
    { key: "published", labelKey: "admin.articles.published" },
    { key: "archived", labelKey: "admin.articles.archived" },
  ];

  function getTranslationBadges(article: ArticleRow) {
    if (!article.article_translations?.length) return null;
    return article.article_translations.map((t) => (
      <span
        key={t.locale}
        className={`inline-flex items-center gap-0.5 rounded border px-1 py-0 text-[9px] font-medium uppercase ${
          TRANSLATION_BADGE[t.status] ?? "bg-muted/10 text-muted border-border"
        }`}
        title={`${t.locale.toUpperCase()}: ${t.status}`}
      >
        {t.locale}
      </span>
    ));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("admin.articles")}</h1>
          <p className="text-sm text-muted">{articles.length} {t("admin.articles.count")}</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          {t("admin.newArticle")}
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Status pills */}
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {STATUS_PILLS.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === key
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              {t(labelKey)}
              <span className="ml-1 text-[10px] opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Pillar dropdown */}
        <select
          value={pillarFilter}
          onChange={(e) => setPillarFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-primary outline-none"
        >
          <option value="">{t("admin.allPillars")}</option>
          {PILLARS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchTitle")}
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-primary outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="px-4 py-16 text-center text-sm text-muted">{t("admin.articles.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="mb-3 text-sm text-muted">
              {articles.length === 0
                ? t("admin.noArticles")
                : t("admin.noResults")}
            </p>
            {articles.length === 0 && (
              <Link
                href="/admin/articles/new"
                className="text-sm text-accent hover:underline"
              >
                {t("admin.articles.createFirst")}
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("admin.articles.colTitle")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("admin.articles.colPillar")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.articles.colStatus")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  <Languages size={12} className="inline" /> i18n
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("admin.articles.colUpdated")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((article) => (
                <tr key={article.id} className="transition-colors hover:bg-elevated">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-sm font-medium hover:text-accent"
                      >
                        {article.title || t("admin.articles.noTitle")}
                      </Link>
                      {article.featured && (
                        <Star size={12} className="shrink-0 text-amber-400" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-muted">{article.slug}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
                    {PILLARS.find((p) => p.id === article.pillar)?.name ?? article.pillar}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_COLORS[article.status] ?? ""
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex items-center gap-1">
                      {getTranslationBadges(article) ?? (
                        <span className="text-[10px] text-muted/50">—</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
                    {new Date(article.updated_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
