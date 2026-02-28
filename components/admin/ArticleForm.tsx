"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PILLARS } from "@/lib/pillars-config";
import {
  Save,
  Send,
  Trash2,
  ImagePlus,
  Loader2,
  EyeOff,
  Archive,
  RotateCcw,
} from "lucide-react";

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  pillar: string;
  tags: string[];
  author: string;
  hero_image: string;
  reading_time: number;
  status: "draft" | "published" | "archived";
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

const STATUS_CONFIG = {
  draft: { label: "Rascunho", color: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  published: { label: "Publicado", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  archived: { label: "Arquivado", color: "bg-muted/10 text-muted border-border" },
} as const;

export function ArticleForm({ initialData, mode }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<ArticleData>(
    initialData ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      pillar: PILLARS[0].id,
      tags: [],
      author: "eximIA",
      hero_image: "",
      reading_time: 0,
      status: "draft",
      sources: [],
    }
  );
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [insertingImage, setInsertingImage] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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

    return {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      pillar: form.pillar,
      tags,
      author: form.author,
      hero_image: form.hero_image || null,
      reading_time: form.reading_time,
      status,
      sources: form.sources.filter((s) => s.title || s.url),
      ...(status === "published" ? { publish_date: new Date().toISOString() } : {}),
    };
  }

  async function saveArticle(statusOverride?: "draft" | "published" | "archived") {
    setError("");
    setSaving(true);

    const supabase = createClient();
    const payload = buildPayload(statusOverride);

    if (mode === "create") {
      const { error: err } = await supabase.from("articles").insert(payload);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", form.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
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

    setSaving(false);
    router.push("/admin/articles");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id || !confirm("Deletar este artigo permanentemente?")) return;

    const supabase = createClient();
    await supabase.from("articles").delete().eq("id", form.id);

    try {
      await fetch("/api/v1/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug }),
      });
    } catch {}

    router.push("/admin/articles");
    router.refresh();
  }

  async function uploadToStorage(file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${form.slug || "upload"}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(fileName, file);

    if (uploadError) {
      setError(`Upload falhou: ${uploadError.message}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
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
    <div className="mx-auto max-w-3xl">
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

      {error && (
        <div className="mb-4 rounded-md border border-red-400/30 bg-red-400/5 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

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

        {/* Pillar + Author row */}
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="mb-1 block text-xs text-muted">Autor</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent"
            />
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

        {/* Content (MDX) */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-muted">Conteudo (MDX)</label>
            <span className="text-[10px] text-muted">
              ~{form.reading_time} min leitura
            </span>
          </div>
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
