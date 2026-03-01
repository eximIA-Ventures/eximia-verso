import type { ImageResult, ProviderAdapter, SearchOptions } from "../types";
import { checkRateLimit } from "../rate-limiter";

const API_BASE = "https://pixabay.com/api";

interface PixabayHit {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  tags: string;
  user: string;
  userImageURL: string;
  pageURL: string;
}

const ORIENTATION_MAP: Record<string, string> = {
  landscape: "horizontal",
  portrait: "vertical",
  squarish: "horizontal",
};

export const pixabay: ProviderAdapter = {
  name: "pixabay",

  isConfigured() {
    return !!process.env.PIXABAY_API_KEY;
  },

  async search(options: SearchOptions): Promise<ImageResult[]> {
    if (!this.isConfigured()) return [];
    if (!checkRateLimit("pixabay", 100, 60_000)) return [];

    const params = new URLSearchParams({
      key: process.env.PIXABAY_API_KEY!,
      q: options.query,
      per_page: String(options.perPage ?? 10),
      page: String(options.page ?? 1),
      image_type: "photo",
      safesearch: "true",
    });

    if (options.orientation && ORIENTATION_MAP[options.orientation]) {
      params.set("orientation", ORIENTATION_MAP[options.orientation]);
    }

    const res = await fetch(`${API_BASE}/?${params}`);

    if (!res.ok) return [];

    const data = (await res.json()) as { hits: PixabayHit[] };

    return data.hits.map((hit) => ({
      id: `pixabay-${hit.id}`,
      url: hit.largeImageURL,
      thumbnailUrl: hit.webformatURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
      alt: hit.tags,
      provider: "pixabay" as const,
      photographer: hit.user,
      photographerUrl: hit.pageURL,
      license: "Pixabay License",
    }));
  },
};
