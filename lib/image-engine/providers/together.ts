import type { GeneratorAdapter, GenerateOptions, ImageResult } from "../types";
import { checkRateLimit } from "../rate-limiter";

const API_BASE = "https://api.together.xyz/v1/images/generations";

interface TogetherResponse {
  data: { url: string; b64_json?: string }[];
}

export const together: GeneratorAdapter = {
  name: "together",

  isConfigured() {
    return !!process.env.TOGETHER_API_KEY;
  },

  async generate(options: GenerateOptions): Promise<ImageResult[]> {
    if (!this.isConfigured()) return [];
    if (!checkRateLimit("together", 50, 60_000)) return [];

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: options.prompt,
        width: options.width ?? 1024,
        height: options.height ?? 768,
        n: 1,
        response_format: "url",
      }),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as TogetherResponse;

    return data.data.map((img, i) => ({
      id: `together-${Date.now()}-${i}`,
      url: img.url,
      thumbnailUrl: img.url,
      width: options.width ?? 1024,
      height: options.height ?? 768,
      alt: options.prompt,
      provider: "together" as const,
      license: "AI Generated",
    }));
  },
};
