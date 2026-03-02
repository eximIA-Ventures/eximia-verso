import { createAdminClient } from "@/lib/supabase/admin";
import { FileText, Eye, FilePen, Archive, Star, Users } from "lucide-react";
import Link from "next/link";
import type { ArticleRow } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/get-server-locale";
import type { TranslationKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = createAdminClient();

  const { count: total } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true });

  const { count: published } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: drafts } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: archived } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "archived");

  const { count: featured } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("featured", true);

  const { count: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  const { data: recent } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(5);

  return {
    total: total ?? 0,
    published: published ?? 0,
    drafts: drafts ?? 0,
    archived: archived ?? 0,
    featured: featured ?? 0,
    subscribers: subscribers ?? 0,
    recent: (recent ?? []) as ArticleRow[],
  };
}

const STAT_CARDS: { key: "total" | "published" | "drafts" | "archived" | "featured" | "subscribers"; labelKey: TranslationKey; icon: typeof FileText; color: string }[] = [
  { key: "total", labelKey: "admin.articles", icon: FileText, color: "text-primary" },
  { key: "published", labelKey: "admin.dashboard.published", icon: Eye, color: "text-green-400" },
  { key: "drafts", labelKey: "admin.dashboard.drafts", icon: FilePen, color: "text-amber-400" },
  { key: "archived", labelKey: "admin.dashboard.archived", icon: Archive, color: "text-muted" },
  { key: "featured", labelKey: "admin.form.featured", icon: Star, color: "text-amber-400" },
  { key: "subscribers", labelKey: "admin.dashboard.subscribers", icon: Users, color: "text-accent" },
];

export default async function AdminDashboard() {
  const locale = await getServerLocale();
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t(locale, "admin.dashboard")}</h1>
        <p className="text-sm text-muted">{t(locale, "admin.dashboard.subtitle")}</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STAT_CARDS.map(({ key, labelKey, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon size={16} className={color} />
              <span className="text-xs text-muted">{t(locale, labelKey)}</span>
            </div>
            <p className="text-2xl font-bold">{stats[key]}</p>
          </div>
        ))}
      </div>

      {/* Recent articles */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">{t(locale, "admin.dashboard.recentArticles")}</h2>
          <Link
            href="/admin/articles/new"
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-bg transition-opacity hover:opacity-90"
          >
            {t(locale, "admin.dashboard.newArticle")}
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted">{t(locale, "admin.dashboard.noArticles")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recent.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}/edit`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-elevated"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{article.title}</p>
                    {article.featured && (
                      <Star size={12} className="shrink-0 text-amber-400" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {article.pillar} · {new Date(article.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    article.status === "published"
                      ? "bg-green-400/10 text-green-400"
                      : article.status === "draft"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-muted/10 text-muted"
                  }`}
                >
                  {article.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
