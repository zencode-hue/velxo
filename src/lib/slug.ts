/**
 * Generates a URL-friendly slug from a product title.
 * e.g. "Netflix Premium 1 Year" → "netflix-premium-1-year"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .trim()
    .replace(/\s+/g, "-")            // spaces to hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .slice(0, 80);                   // max length
}

/**
 * Builds the full product URL path using slug + id.
 * e.g. /products/netflix-premium-1-year--cm1abc123
 */
export function productPath(id: string, title: string, slug?: string | null): string {
  const s = slug ?? slugify(title);
  return `/products/${s}--${id}`;
}

/**
 * Extracts the product ID from a slug-based URL segment.
 * e.g. "netflix-premium-1-year--cm1abc123" → "cm1abc123"
 * Falls back to treating the whole segment as an ID (backward compat).
 */
export function extractProductId(segment: string): string {
  const parts = segment.split("--");
  return parts.length > 1 ? parts[parts.length - 1] : segment;
}
