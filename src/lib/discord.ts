/**
 * Discord webhook service with exponential backoff retry.
 * Requirements: 11.1, 11.4, 11.5
 */

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function sendDiscordNotification(url: string, payload: object): Promise<void> {
  if (!url) return;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) return;

      lastError = new Error(`Discord webhook returned ${res.status}: ${await res.text()}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    if (attempt < MAX_RETRIES - 1) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Log permanent failure after all retries exhausted
  console.error(`[discord] Permanent failure after ${MAX_RETRIES} attempts:`, lastError?.message);
}
