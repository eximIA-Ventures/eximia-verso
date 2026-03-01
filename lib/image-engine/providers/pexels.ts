import type { ImageResult, ProviderAdapter, SearchOptions } from "../types";
import { checkRateLimit } from "../rate-limiter";

const API_BASE = "https://api.pexels.com/v1";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  photographer_url: string;
  src: { original: string; large: string; medium: string; small: string; tiny: string };
}

export const pexels: ProviderAdapter = {
  name: "pexels",

  isConfigured() {
    return !!process.env.PEXELS_API_KEY;
  },

  async search(options: SearchOptions): Promise<ImageResult[]> {
    if (!this.isConfigured()) return [];
    if (!checkRateLimit("pexels", 200, 3_600_000)) return [];

    const params = new URLSearchParams({
      query: options.query,
      per_page: String(options.perPage ?? 10),
      page: String(options.page ?? 1),
    });

    if (options.orientation) {
      params.set("orientation", options.orientation);
    }

    const res = await fetch(`${API_BASE}/search?${params}`, {
      headers: { Authorization: process.env.PEXELS_API_KEY! },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { photos: PexelsPhoto[] };

    return data.photos.map((photo) => ({
      id: `pexels-${photo.id}`,
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || options.query,
      provider: "pexels" as const,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      license: "Pexels License",
    }));
  },
};
