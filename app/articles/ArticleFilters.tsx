"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { ArticleCard, FeaturedArticleCard } from "@/components/ArticleCard";
import { PillarIcon } from "@/components/PillarIcon";
import { useLocale } from "@/components/LocaleProvider";
import type { ArticleMeta, Pillar } from "@/lib/types";

type SortOption = "newest" | "oldest" | "reading-time";

interface ArticleFiltersProps {
  pillars: Pillar[];
  articles: ArticleMeta[];
}

export function ArticleFilters({ pillars, articles }: ArticleFiltersProps) {
  const { t } = useLocale();
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let result = articles;

    if (activePillar) {
      result = result.filter((a) => a.pillar === activePillar);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (sort === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
      );
    } else if (sort === "reading-time") {
      result = [...result].sort((a, b) => a.readingTime - b.readingTime);
    }

    return result;
  }, [articles, activePillar, search, sort]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* Search + Sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("insights.search")}
            className="w-full rounded-lg border border-border/50 bg-surface/50 py-2 pl-9 pr-3 text-sm text-primary outline-none transition-colors placeholder:text-muted/50 focus:border-accent"
          />
        </div>

        <div className="relative">
          <ArrowUpDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none rounded-lg border border-border/50 bg-surface/50 py-2 pl-8 pr-8 text-xs text-muted outline-none transition-colors focus:border-accent cursor-pointer"
          >
            <option value="newest">{t("insights.sort.newest")}</option>
            <option value="oldest">{t("insights.sort.oldest")}</option>
            <option value="reading-time">{t("insights.sort.reading")}</option>
          </select>
        </div>
      </div>

      {/* Pillar filters */}
      {pillars.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActivePillar(null)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activePillar === null
                ? "bg-primary text-bg"
                : "border border-border/50 text-muted hover:border-border hover:text-primary"
            }`}
          >
            {t("insights.all")}
          </button>
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              onClick={() =>
                setActivePillar(activePillar === pillar.id ? null : pillar.id)
              }
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                activePillar === pillar.id
                  ? "bg-primary text-bg"
                  : "border border-border/50 text-muted hover:border-border hover:text-primary"
              }`}
            >
              <PillarIcon icon={pillar.icon} size={12} />
              {pillar.name}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/30 py-20 text-center">
          <p className="text-sm text-muted">
            {search.trim()
              ? t("insights.empty.search")
              : activePillar
                ? t("insights.empty.pillar")
                : t("insights.empty.default")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured first */}
          {featured && !search.trim() && (
            <FeaturedArticleCard article={featured} />
          )}

          {/* Grid */}
          {(search.trim() ? filtered : rest).length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(search.trim() ? filtered : rest).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
