import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ArticleRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  const articles = (data ?? []) as ArticleRow[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Artigos</h1>
          <p className="text-sm text-muted">{articles.length} artigos</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Novo artigo
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        {articles.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="mb-3 text-sm text-muted">Nenhum artigo criado.</p>
            <Link
              href="/admin/articles/new"
              className="text-sm text-accent hover:underline"
            >
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Titulo</th>
                <th className="px-4 py-3 font-medium">Pilar</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Atualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="transition-colors hover:bg-elevated">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm font-medium hover:text-accent"
                    >
                      {article.title || "Sem titulo"}
                    </Link>
                    <p className="text-xs text-muted">{article.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{article.pillar}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        article.status === "published"
                          ? "bg-green-400/10 text-green-400"
                          : article.status === "draft"
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-muted/10 text-muted"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
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
