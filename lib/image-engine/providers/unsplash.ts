import type { ImageResult, ProviderAdapter, SearchOptions } from "../types";
import { checkRateLimit } from "../rate-limiter";

const API_BASE = "https://api.unsplash.com";

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  alt_description: string | null;
  description: string | null;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  user: { name: string; links: { html: string } };
}

export const unsplash: ProviderAdapter = {
  name: "unsplash",

  isConfigured() {
    return !!process.env.UNSPLASH_ACCESS_KEY;
  },

  async search(options: SearchOptions): Promise<ImageResult[]> {
    if (!this.isConfigured()) return [];
    if (!checkRateLimit("unsplash", 50, 3_600_000)) return [];

    const params = new URLSearchParams({
      query: options.query,
      per_page: String(options.perPage ?? 10),
      page: String(options.page ?? 1),
    });

    if (options.orientation) {
      params.set("orientation", options.orientation);
    }

    const res = await fetch(`${API_BASE}/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { results: UnsplashPhoto[] };

    return data.results.map((photo) => ({
      id: `unsplash-${photo.id}`,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description ?? photo.description ?? options.query,
      provider: "unsplash" as const,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      license: "Unsplash License",
    }));
  },
};
