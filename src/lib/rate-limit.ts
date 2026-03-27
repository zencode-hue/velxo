interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

/**
 * Sliding window rate limiter — no external dependencies.
 * @param ip       Client IP address
 * @param limit    Max requests allowed in the window (default: 60)
 * @param windowMs Window size in milliseconds (default: 60000)
 */
export function rateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Evict timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limit) {
    // Oldest timestamp in window determines when the window resets
    const reset = Math.ceil((entry.timestamps[0] + windowMs) / 1000);
    return { success: false, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  const remaining = limit - entry.timestamps.length;
  const reset = Math.ceil((now + windowMs) / 1000);

  return { success: true, remaining, reset };
}
