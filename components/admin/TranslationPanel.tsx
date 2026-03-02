"use client";

import { useState, useEffect } from "react";
import { Languages, Loader2, Check, AlertTriangle, RefreshCw, Send } from "lucide-react";
import { useToast } from "./Toast";
import type { ArticleTranslation } from "@/lib/types";
import { useLocale } from "@/components/LocaleProvider";

interface Props {
  articleId: string;
  articleUpdatedAt?: string;
}

const LOCALES = [
  { code: "en" as const, label: "English", flag: "🇺🇸" },
  { code: "es" as const, label: "Español", flag: "🇪🇸" },
];

const STATUS_STYLES: Record<string, { labelKey: "admin.translationStatus.draft" | "admin.translationStatus.published" | "admin.translationStatus.needsReview"; color: string }> = {
  draft: { labelKey: "admin.translationStatus.draft", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  published: { labelKey: "admin.translationStatus.published", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  needs_review: { labelKey: "admin.translationStatus.needsReview", color: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
};

export function TranslationPanel({ articleId, articleUpdatedAt }: Props) {
  const { t } = useLocale();
  const toast = useToast();
  const [translations, setTranslations] = useState<ArticleTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState<string | null>(null);
  const [expandedLocale, setExpandedLocale] = useState<string | null>(null);

  async function loadTranslations() {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/translations`);
      const data = await res.json();
      setTranslations(data.translations ?? []);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTranslations();
  }, [articleId]);

  async function handleTranslate(locale: "en" | "es", force: boolean = false) {
    setTranslating(locale);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, force }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(`Erro: ${err.error}`);
        setTranslating(null);
        return;
      }

      toast.success(`Tradução ${locale.toUpperCase()} criada`);
      await loadTranslations();
    } catch (err) {
      toast.error(`Erro ao traduzir: ${err}`);
    } finally {
      setTranslating(null);
    }
  }

  async function handlePublish(locale: "en" | "es") {
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/translations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, action: "publish" }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(`Erro: ${err.error}`);
        return;
      }

      toast.success(`Tradução ${locale.toUpperCase()} publicada`);
      await loadTranslations();
    } catch (err) {
      toast.error(`Erro ao publicar: ${err}`);
    }
  }

  function isStale(translation: ArticleTranslation): boolean {
    if (!articleUpdatedAt) return false;
    return new Date(articleUpdatedAt) > new Date(translation.translatedAt);
  }

  if (loading) {
    return (
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          {t("admin.translations.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Languages size={16} className="text-accent" />
        <h3 className="text-sm font-medium">{t("admin.translations")}</h3>
      </div>

      <div className="space-y-3">
        {LOCALES.map(({ code, label, flag }) => {
          const translation = translations.find((t) => t.locale === code);
          const stale = translation ? isStale(translation) : false;
          const statusStyle = translation ? STATUS_STYLES[translation.status] : null;
          const isExpanded = expandedLocale === code;

          return (
            <div key={code} className="rounded-lg border border-border bg-surface/50">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{flag}</span>
                  <span className="text-sm font-medium">{label}</span>
                  {translation && statusStyle && (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle.color}`}>
                      {t(statusStyle.labelKey)}
                    </span>
                  )}
                  {stale && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-400">
                      <AlertTriangle size={10} />
                      {t("admin.translationStatus.stale")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!translation ? (
                    <button
                      onClick={() => handleTranslate(code)}
                      disabled={translating === code}
                      className="flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                    >
                      {translating === code ? (
                        <><Loader2 size={12} className="animate-spin" /> {t("admin.translating")}</>
                      ) : (
                        <><Languages size={12} /> {t("admin.translate")}</>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleTranslate(code, true)}
                        disabled={translating === code}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted transition-colors hover:bg-elevated disabled:opacity-50"
                        title="Retraduzir"
                      >
                        {translating === code ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <RefreshCw size={10} />
                        )}
                        {t("admin.retranslate")}
                      </button>
                      {translation.status !== "published" && (
                        <button
                          onClick={() => handlePublish(code)}
                          className="flex items-center gap-1 rounded-md bg-green-500/10 border border-green-500/20 px-2 py-1 text-[10px] font-medium text-green-400 transition-colors hover:bg-green-500/20"
                        >
                          <Send size={10} />
                          {t("admin.publishTranslation")}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedLocale(isExpanded ? null : code)}
                        className="rounded-md border border-border px-2 py-1 text-[10px] text-muted transition-colors hover:bg-elevated"
                      >
                        {isExpanded ? t("admin.translations.close") : t("admin.translations.view")}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded preview */}
              {isExpanded && translation && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  <div>
                    <label className="text-[10px] text-muted uppercase tracking-wider">{t("admin.translations.title")}</label>
                    <p className="text-sm">{translation.title}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase tracking-wider">{t("admin.translations.excerpt")}</label>
                    <p className="text-sm text-muted">{translation.excerpt}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase tracking-wider">{t("admin.translations.content")}</label>
                    <pre className="mt-1 max-h-48 overflow-auto rounded border border-border bg-bg p-2 text-[11px] text-muted">
                      {translation.content.slice(0, 1000)}{translation.content.length > 1000 ? "..." : ""}
                    </pre>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted">
                    <span>{t("admin.translations.translatedBy")}: {translation.translatedBy}</span>
                    {translation.modelUsed && <span>{t("admin.translations.model")}: {translation.modelUsed}</span>}
                    <span>{t("admin.translations.date")}: {new Date(translation.translatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
