"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PILLARS } from "@/lib/pillars-config";
import { useToast } from "@/components/admin/Toast";
import {
  Save,
  Send,
  Trash2,
  ImagePlus,
  Loader2,
  EyeOff,
  Archive,
  RotateCcw,
  Eye,
  Star,
  X,
} from "lucide-react";

interface AuthorOption {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
}

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  pillar: string;
  tags: string[];
  author: string;
  author_ids: string[];
  hero_image: string;
  reading_time: number;
  status: "draft" | "published" | "archived";
  publish_date: string;
  featured: boolean;
  sources: { title: string; url: string }[];
}

interface Props {
  initialData?: ArticleData;
  mode: "create" | "edit";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function toLocalDatetime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_CONFIG = {
  draft: { label: "Rascunho", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  published: { label: "Publicado", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  archived: { label: "Arquivado", color: "bg-muted/10 text-muted border-border" },
} as const;

export function ArticleForm({ initialData, mode }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<ArticleData>(
    initialData ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      pillar: PILLARS[0].id,
      tags: [],
      author: "eximIA",
      author_ids: [],
      hero_image: "",
      reading_time: 0,
      status: "draft",
      publish_date: "",
      featured: false,
      sources: [],
    }
  );
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [insertingImage, setInsertingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Authors
  const [allAuthors, setAllAuthors] = useState<AuthorOption[]>([]);
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data: AuthorOption[]) => setAllAuthors(data))
      .catch(() => {});
  }, []);

  // MDX preview with debounce
  const fetchPreview = useCallback(async (mdx: string) => {
    if (!mdx.trim()) {
      setPreviewHtml("");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: mdx }),
      });
      if (res.ok) {
        const { html } = await res.json();
        setPreviewHtml(html);
      }
    } catch {
      // Silent fail on preview
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showPreview) return;
    const timer = setTimeout(() => fetchPreview(form.content), 500);
    return () => clearTimeout(timer);
  }, [form.content, showPreview, fetchPreview]);

  function updateField<K extends keyof ArticleData>(key: K, value: ArticleData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && autoSlug) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
    if (key === "content") {
      setForm((prev) => ({
        ...prev,
        reading_time: estimateReadingTime(value as string),
      }));
    }
  }

  function updateSource(idx: number, field: "title" | "url", value: string) {
    const updated = [...form.sources];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm((prev) => ({ ...prev, sources: updated }));
  }

  function addSource() {
    setForm((prev) => ({
      ...prev,
      sources: [...prev.sources, { title: "", url: "" }],
    }));
  }

  function removeSource(idx: number) {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== idx),
    }));
  }

  function buildPayload(statusOverride?: "draft" | "published" | "archived") {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const status = statusOverride ?? form.status;

    let publishDate = form.publish_date || null;
    if (status === "published" && !publishDate) {
      publishDate = new Date().toISOString();
    }

    return {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      pillar: form.pillar,
      tags,
      author: form.author,
      author_ids: form.author_ids,
      hero_image: form.hero_image || null,
      reading_time: form.reading_time,
      status,
      publish_date: publishDate,
      featured: form.featured,
      sources: form.sources.filter((s) => s.title || s.url),
    };
  }

  async function saveArticle(statusOverride?: "draft" | "published" | "archived") {
    setSaving(true);

    const payload = buildPayload(statusOverride);

    try {
      const url = mode === "create"
        ? "/api/admin/articles"
        : `/api/admin/articles/${form.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(`Erro ao salvar: ${err.error || "Erro desconhecido"}`);
        setSaving(false);
        return;
      }
    } catch (err) {
      toast.error(`Erro ao salvar: ${err}`);
      setSaving(false);
      return;
    }

    // Revalidar cache ISR
    try {
      await fetch("/api/v1/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug }),
      });
    } catch {
      // Non-blocking
    }

    const actionLabel = statusOverride === "published"
      ? "Artigo publicado"
      : statusOverride === "draft"
        ? "Artigo despublicado"
        : statusOverride === "archived"
          ? "Artigo arquivado"
          : "Artigo salvo";

    toast.success(actionLabel);
    setSaving(false);
    router.push("/admin/articles");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;

    const res = await fetch(`/api/admin/articles/${form.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      toast.error(`Erro ao deletar: ${err.error || "Erro desconhecido"}`);
      return;
    }

    try {
      await fetch("/api/v1/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug }),
      });
    } catch {}

    toast.success("Artigo deletado");
    router.push("/admin/articles");
    router.refresh();
  }

  async function uploadToStorage(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const fileName = `${form.slug || "upload"}-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(`Upload falhou: ${err.error || "Erro desconhecido"}`);
      return null;
    }

    const { url } = await res.json();
    toast.success("Imagem enviada");
    return url;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToStorage(file);
    if (url) updateField("hero_image", url);
  }

  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);

    const url = await uploadToStorage(file);
    if (!url) {
      setInsertingImage(false);
      return;
    }

    const textarea = contentRef.current;
    const altText = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const markdown = `\n\n![${altText}](${url})\n\n`;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = form.content.slice(0, start);
      const after = form.content.slice(end);
      const newContent = before + markdown + after;
      updateField("content", newContent);

      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + markdown.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    } else {
      updateField("content", form.content + markdown);
    }

    setInsertingImage(false);
    e.target.value = "";
  }

  const canSave = form.title && form.slug;
  const canPublish = canSave && form.content;
  const statusCfg = STATUS_CONFIG[form.status];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "create" ? "Novo artigo" : "Editar artigo"}
          </h1>
          {mode === "edit" && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md border border-red-400/30 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-400/10"
            >
              <Trash2 size={14} />
              Deletar
            </button>
          )}
        </div>
      </div>

      {/* Action bar — contextual por status */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-3">
        {/* Salvar (sempre) */}
        <button
          onClick={() => saveArticle()}
          disabled={saving || !canSave}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-primary transition-colors hover:bg-elevated disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar"}
        </button>

        {/* Publicar (quando draft ou archived) */}
        {form.status !== "published" && (
          <button
            onClick={() => saveArticle("published")}
            disabled={saving || !canPublish}
            className="flex items-center gap-1.5 rounded-md bg-green-500/90 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send size={14} />
            Publicar
          </button>
        )}

        {/* Despublicar (quando published) */}
        {form.status === "published" && (
          <button
            onClick={() => saveArticle("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-amber-400/30 px-3 py-1.5 text-sm text-amber-400 transition-colors hover:bg-amber-400/10 disabled:opacity-50"
          >
            <EyeOff size={14} />
            Despublicar
          </button>
        )}

        {/* Arquivar (quando draft ou published) */}
        {form.status !== "archived" && (
          <button
            onClick={() => saveArticle("archived")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-elevated disabled:opacity-50"
          >
            <Archive size={14} />
            Arquivar
          </button>
        )}

        {/* Restaurar (quando archived) */}
        {form.status === "archived" && (
          <button
            onClick={() => saveArticle("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-elevated disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Restaurar rascunho
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs text-muted">Titulo</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Titulo do artigo"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Slug */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="text-xs text-muted">Slug</label>
            {mode === "create" && (
              <label className="flex items-center gap-1 text-[10px] text-muted">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="accent-accent"
                />
                Auto
              </label>
            )}
          </div>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setAutoSlug(false);
              updateField("slug", e.target.value);
            }}
            placeholder="url-do-artigo"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1 block text-xs text-muted">Resumo</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            placeholder="Resumo do artigo (2-3 frases)"
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Pillar */}
        <div>
          <label className="mb-1 block text-xs text-muted">Pilar</label>
          <select
            value={form.pillar}
            onChange={(e) => updateField("pillar", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
          >
            {PILLARS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Authors multi-select */}
        <div>
          <label className="mb-1 block text-xs text-muted">Autores</label>
          {/* Selected authors chips */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 min-h-[42px]">
            {form.author_ids.map((id, idx) => {
              const author = allAuthors.find((a) => a.id === id);
              if (!author) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
                >
                  {author.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={author.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                  ) : null}
                  {author.name}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = [...form.author_ids];
                        newIds.splice(idx, 1);
                        newIds.splice(idx - 1, 0, id);
                        setForm((prev) => ({ ...prev, author_ids: newIds }));
                      }}
                      className="text-accent/50 hover:text-accent"
                      title="Mover para cima"
                    >
                      ↑
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        author_ids: prev.author_ids.filter((aid) => aid !== id),
                      }));
                    }}
                    className="text-accent/50 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            {/* Dropdown trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAuthorDropdownOpen(!authorDropdownOpen)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-elevated hover:text-primary"
              >
                + Adicionar autor
              </button>
              {authorDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-bg py-1 shadow-lg">
                  {allAuthors
                    .filter((a) => !form.author_ids.includes(a.id))
                    .map((author) => (
                      <button
                        key={author.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            author_ids: [...prev.author_ids, author.id],
                            author: prev.author_ids.length === 0 ? author.name : prev.author,
                          }));
                          setAuthorDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-elevated"
                      >
                        {author.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={author.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[9px] font-bold text-accent">
                            {author.name.charAt(0)}
                          </div>
                        )}
                        {author.name}
                      </button>
                    ))}
                  {allAuthors.filter((a) => !form.author_ids.includes(a.id)).length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted">Todos os autores já selecionados</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Fallback author text (hidden, auto-filled) */}
          <input type="hidden" value={form.author} />
        </div>

        {/* Publish date + Featured row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Data de publicacao</label>
            <input
              type="datetime-local"
              value={toLocalDatetime(form.publish_date)}
              onChange={(e) =>
                updateField(
                  "publish_date",
                  e.target.value ? new Date(e.target.value).toISOString() : ""
                )
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
            />
            <p className="mt-1 text-[10px] text-muted">
              Vazio = auto-fill ao publicar
            </p>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-primary transition-colors hover:bg-elevated">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="accent-accent"
              />
              <Star size={14} className={form.featured ? "text-amber-400" : "text-muted"} />
              Marcar como destaque
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-xs text-muted">
            Tags (separadas por virgula)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ia, estratégia, negócios"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
          />
        </div>

        {/* Hero image */}
        <div>
          <label className="mb-1 block text-xs text-muted">Imagem de capa</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={form.hero_image}
              onChange={(e) => updateField("hero_image", e.target.value)}
              placeholder="URL da imagem ou faca upload"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
            />
            <label className="cursor-pointer rounded-md border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:bg-elevated">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          {form.hero_image && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.hero_image}
                alt="Preview"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Content (MDX) with preview toggle */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-muted">Conteudo (MDX)</label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted">
                ~{form.reading_time} min leitura
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                  showPreview
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-primary"
                }`}
              >
                <Eye size={12} />
                Preview
              </button>
            </div>
          </div>

          <div className={showPreview ? "grid grid-cols-2 gap-4" : ""}>
            {/* Editor */}
            <div>
              {/* Toolbar */}
              <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-elevated px-2 py-1.5">
                <label
                  className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                    insertingImage
                      ? "text-accent"
                      : "text-muted hover:bg-surface hover:text-primary"
                  }`}
                >
                  {insertingImage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ImagePlus size={14} />
                  )}
                  {insertingImage ? "Enviando..." : "Inserir imagem"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInsertImage}
                    disabled={insertingImage}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Escreva em Markdown/MDX..."
                rows={20}
                className="w-full rounded-b-lg rounded-t-none border border-border bg-surface px-3 py-2.5 font-mono text-sm text-primary outline-none transition-colors focus:border-accent"
              />
            </div>

            {/* Preview pane */}
            {showPreview && (
              <div className="overflow-auto rounded-lg border border-border bg-surface p-4">
                {previewLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Loader2 size={14} className="animate-spin" />
                    Compilando...
                  </div>
                )}
                {!previewLoading && previewHtml && (
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                )}
                {!previewLoading && !previewHtml && (
                  <p className="text-xs text-muted">
                    Comece a escrever para ver o preview.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs text-muted">Fontes</label>
            <button
              type="button"
              onClick={addSource}
              className="text-xs text-accent hover:underline"
            >
              + Adicionar fonte
            </button>
          </div>
          {form.sources.map((source, idx) => (
            <div key={idx} className="mb-2 flex items-center gap-2">
              <input
                type="text"
                value={source.title}
                onChange={(e) => updateSource(idx, "title", e.target.value)}
                placeholder="Titulo da fonte"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent"
              />
              <input
                type="url"
                value={source.url}
                onChange={(e) => updateSource(idx, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeSource(idx)}
                className="text-muted hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
