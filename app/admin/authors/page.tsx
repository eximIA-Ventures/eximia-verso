"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Upload, Linkedin, Twitter, Globe, Mail } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { useLocale } from "@/components/LocaleProvider";

interface AuthorData {
  id?: string;
  slug: string;
  name: string;
  bio: string;
  avatar_url: string;
  role: string;
  social_links: Record<string, string>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AuthorsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AuthorData | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(false);

  const fetchAuthors = useCallback(async () => {
    const res = await fetch("/api/admin/authors");
    if (res.ok) {
      setAuthors(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  function openNew() {
    setAutoSlug(true);
    setEditing({
      slug: "",
      name: "",
      bio: "",
      avatar_url: "",
      role: "author",
      social_links: {},
    });
  }

  function openEdit(author: AuthorData) {
    setAutoSlug(false);
    setEditing({ ...author });
  }

  async function handleSave() {
    if (!editing || !editing.name || !editing.slug) return;
    setSaving(true);

    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/authors"
      : `/api/admin/authors/${editing.id}`;
    const method = isNew ? "POST" : "PATCH";

    const { id, ...body } = editing;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(`${t("admin.toast.saveError")}: ${err.error || t("admin.toast.unknownError")}`);
      setSaving(false);
      return;
    }

    toast.success(isNew ? t("admin.authors.created") : t("admin.authors.updated"));
    setSaving(false);
    setEditing(null);
    fetchAuthors();
  }

  async function handleDelete(author: AuthorData) {
    if (!author.id) return;
    if (!confirm(`Deletar "${author.name}"?`)) return;

    const res = await fetch(`/api/admin/authors/${author.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(`${t("admin.toast.deleteError")}: ${err.error || t("admin.toast.unknownError")}`);
      return;
    }

    toast.success(t("admin.authors.deleted"));
    fetchAuthors();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const fileName = `author-${editing.slug || "new"}-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      toast.error(t("admin.toast.uploadError"));
      return;
    }

    const { url } = await res.json();
    setEditing({ ...editing, avatar_url: url });
    toast.success(t("admin.authors.avatarUploaded"));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("admin.authors")}
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          {t("admin.authors.new")}
        </button>
      </div>

      {/* Author list */}
      <div className="space-y-2">
        {authors.map((author) => (
          <div
            key={author.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface/50 px-4 py-3 transition-colors hover:bg-surface"
          >
            {/* Avatar */}
            {author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatar_url}
                alt={author.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-sm font-semibold text-white">
                {author.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary">{author.name}</p>
              <p className="truncate text-xs text-muted">
                {author.role} · /{author.slug}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openEdit(author)}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-elevated hover:text-primary"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(author)}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-400/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {authors.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            {t("admin.authors.empty")}
          </p>
        )}
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {editing.id ? t("admin.authors.edit") : t("admin.authors.new")}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-muted hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted">{t("admin.authors.name")}</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditing({
                      ...editing,
                      name,
                      ...(autoSlug ? { slug: slugify(name) } : {}),
                    });
                  }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">{t("admin.authors.slug")}</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setEditing({ ...editing, slug: e.target.value });
                  }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">{t("admin.authors.bio")}</label>
                <textarea
                  value={editing.bio}
                  onChange={(e) =>
                    setEditing({ ...editing, bio: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">{t("admin.authors.role")}</label>
                <input
                  type="text"
                  value={editing.role}
                  onChange={(e) =>
                    setEditing({ ...editing, role: e.target.value })
                  }
                  placeholder={t("admin.authors.rolePlaceholder")}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">{t("admin.authors.avatar")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editing.avatar_url}
                    onChange={(e) =>
                      setEditing({ ...editing, avatar_url: e.target.value })
                    }
                    placeholder={t("admin.authors.avatarPlaceholder")}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
                  />
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:bg-elevated">
                    <Upload size={14} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {editing.avatar_url && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editing.avatar_url}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Social links */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs text-muted">{t("admin.authors.socialLinks")}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing({
                        ...editing,
                        social_links: { ...editing.social_links, "": "" },
                      });
                    }}
                    className="text-xs text-accent hover:underline"
                  >
                    {t("admin.authors.addLink")}
                  </button>
                </div>

                {/* Quick-add presets */}
                {(() => {
                  const existing = Object.keys(editing.social_links).map((k) => k.toLowerCase());
                  const presets = [
                    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
                    { key: "twitter", label: "X / Twitter", icon: Twitter },
                    { key: "website", label: "Website", icon: Globe },
                    { key: "email", label: "Email", icon: Mail },
                  ].filter((p) => !existing.includes(p.key));

                  if (presets.length === 0) return null;
                  return (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {presets.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => {
                            setEditing({
                              ...editing,
                              social_links: { ...editing.social_links, [p.key]: "" },
                            });
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted transition-colors hover:bg-elevated hover:text-primary"
                        >
                          <p.icon size={12} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  {Object.entries(editing.social_links).map(([platform, url], idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => {
                          const entries = Object.entries(editing.social_links);
                          entries[idx] = [e.target.value, url];
                          setEditing({
                            ...editing,
                            social_links: Object.fromEntries(entries),
                          });
                        }}
                        placeholder={t("admin.authors.platform")}
                        className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                      />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          setEditing({
                            ...editing,
                            social_links: { ...editing.social_links, [platform]: e.target.value },
                          });
                        }}
                        placeholder="https://..."
                        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-primary outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...editing.social_links };
                          delete updated[platform];
                          setEditing({ ...editing, social_links: updated });
                        }}
                        className="text-muted hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:bg-elevated"
              >
                {t("admin.authors.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.name || !editing.slug}
                className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {saving ? t("admin.saving") : t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
