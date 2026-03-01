import type { ImageResult, SearchOptions } from "./types";

const MIN_WIDTH_HERO = 1200;

function scoreResult(result: ImageResult, query: string): number {
  let score = 0;

  const queryTerms = query.toLowerCase().split(/\s+/);
  const alt = result.alt.toLowerCase();
  for (const term of queryTerms) {
    if (alt.includes(term)) score += 10;
  }

  if (result.width >= MIN_WIDTH_HERO) score += 15;
  else if (result.width >= 800) score += 8;

  const ratio = result.width / result.height;
  if (ratio >= 1.3 && ratio <= 2.0) score += 10;

  const providerBonus: Record<string, number> = {
    unsplash: 5,
    pexels: 3,
    pixabay: 2,
  };
  score += providerBonus[result.provider] ?? 0;

  return score;
}

function deduplicateByDimensions(results: ImageResult[]): ImageResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.width}x${r.height}-${r.provider}-${r.alt.slice(0, 30)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function aggregateResults(
  resultsByProvider: ImageResult[][],
  options: SearchOptions
): ImageResult[] {
  const all = resultsByProvider.flat();
  const deduped = deduplicateByDimensions(all);

  const scored = deduped.map((r) => ({
    ...r,
    score: scoreResult(r, options.query),
  }));

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return scored;
}
