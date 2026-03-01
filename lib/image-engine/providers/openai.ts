import type { GeneratorAdapter, GenerateOptions, ImageResult } from "../types";
import { checkRateLimit } from "../rate-limiter";

const API_BASE = "https://api.openai.com/v1/images/generations";

interface OpenAIResponse {
  data: { url: string; revised_prompt?: string }[];
}

export const openai: GeneratorAdapter = {
  name: "openai",

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  },

  async generate(options: GenerateOptions): Promise<ImageResult[]> {
    if (!this.isConfigured()) return [];
    if (!checkRateLimit("openai", 20, 60_000)) return [];

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1-mini",
        prompt: options.prompt,
        n: 1,
        size: `${options.width ?? 1024}x${options.height ?? 1024}`,
      }),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as OpenAIResponse;

    return data.data.map((img, i) => ({
      id: `openai-${Date.now()}-${i}`,
      url: img.url,
      thumbnailUrl: img.url,
      width: options.width ?? 1024,
      height: options.height ?? 1024,
      alt: img.revised_prompt ?? options.prompt,
      provider: "openai" as const,
      license: "AI Generated (OpenAI)",
    }));
  },
};
