import type {
  ImageProvider,
  ImageResult,
  SearchOptions,
  GenerateOptions,
  DownloadOptions,
  DownloadResult,
} from "./types";
import { unsplash } from "./providers/unsplash";
import { pexels } from "./providers/pexels";
import { pixabay } from "./providers/pixabay";
import { together } from "./providers/together";
import { openai } from "./providers/openai";
import { aggregateResults } from "./aggregator";
import { downloadImage } from "./downloader";

const searchProviders = [unsplash, pexels, pixabay];
const generatorProviders = { together, openai };

export async function search(options: SearchOptions): Promise<ImageResult[]> {
  const activeProviders = searchProviders.filter((p) => {
    if (options.providers && !options.providers.includes(p.name)) return false;
    return p.isConfigured();
  });

  const results = await Promise.allSettled(
    activeProviders.map((p) => p.search(options))
  );

  const fulfilled = results
    .filter(
      (r): r is PromiseFulfilledResult<ImageResult[]> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  return aggregateResults(fulfilled, options);
}

export async function generate(
  options: GenerateOptions
): Promise<ImageResult[]> {
  const providerName = options.provider ?? "together";
  const generator = generatorProviders[providerName];

  if (!generator || !generator.isConfigured()) {
    throw new Error(`Generator "${providerName}" is not configured`);
  }

  return generator.generate(options);
}

export async function download(
  options: DownloadOptions
): Promise<DownloadResult> {
  return downloadImage(options);
}

export type {
  ImageProvider,
  ImageResult,
  SearchOptions,
  GenerateOptions,
  DownloadOptions,
  DownloadResult,
} from "./types";
