"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface MediaFile {
  name: string;
  url: string;
  created_at: string;
}

export default function MediaPage() {
  const { t } = useLocale();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadFiles = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("article-images")
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (!data) return;

    const items: MediaFile[] = data
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => {
        const { data: urlData } = supabase.storage
          .from("article-images")
          .getPublicUrl(f.name);
        return {
          name: f.name,
          url: urlData.publicUrl,
          created_at: f.created_at,
        };
      });

    setFiles(items);
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);

    const supabase = createClient();
    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await supabase.storage.from("article-images").upload(fileName, file);
    }

    setUploading(false);
    loadFiles();
  }

  async function handleDelete(name: string) {
    if (!confirm(`Deletar ${name}?`)) return;
    const supabase = createClient();
    await supabase.storage.from("article-images").remove([name]);
    loadFiles();
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("admin.media")}</h1>
        <p className="text-sm text-muted">{t("admin.media.subtitle")}</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-muted" />
        <p className="mb-2 text-sm text-muted">
          {uploading ? t("admin.media.uploading") : t("admin.media.dragHint")}
        </p>
        <label className="cursor-pointer text-sm text-accent hover:underline">
          {t("admin.media.selectFiles")}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Gallery */}
      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">{t("admin.media.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="group relative overflow-hidden rounded-lg border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.name}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex w-full items-center justify-between p-2">
                  <p className="truncate text-[10px] text-white/80">{file.name}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(file.url)}
                      className="rounded p-1 text-white/80 hover:bg-white/20"
                      title={t("admin.media.copyUrl")}
                    >
                      {copied === file.url ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="rounded p-1 text-red-300 hover:bg-white/20"
                      title={t("admin.media.delete")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
