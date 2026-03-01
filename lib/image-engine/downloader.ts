import { createAdminClient } from "@/lib/supabase/admin";
import type { DownloadOptions, DownloadResult } from "./types";

const BUCKET = "article-images";

export async function downloadImage(
  options: DownloadOptions
): Promise<DownloadResult> {
  const res = await fetch(options.imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

  const fileName =
    options.fileName ??
    `${options.provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = await res.arrayBuffer();
  const file = new Blob([buffer], { type: contentType });

  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return {
    publicUrl: urlData.publicUrl,
    fileName,
    bucket: BUCKET,
  };
}
