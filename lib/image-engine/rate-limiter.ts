interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  provider: string,
  maxTokens: number,
  refillIntervalMs: number
): boolean {
  const now = Date.now();
  let entry = buckets.get(provider);

  if (!entry) {
    entry = { tokens: maxTokens, lastRefill: now };
    buckets.set(provider, entry);
  }

  const elapsed = now - entry.lastRefill;
  const refills = Math.floor(elapsed / refillIntervalMs);

  if (refills > 0) {
    entry.tokens = Math.min(maxTokens, entry.tokens + refills);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return false;
  }

  entry.tokens--;
  return true;
}
