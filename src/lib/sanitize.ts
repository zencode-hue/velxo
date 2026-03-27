/**
 * Strips HTML tags and trims surrounding whitespace from a string.
 */
export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Recursively sanitizes all string values in a plain object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
