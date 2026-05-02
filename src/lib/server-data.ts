/**
 * Server-side data fetching helpers.
 * Call DB directly — never fetch your own API routes from server components.
 * This avoids hostname resolution failures on Vercel.
 */

import { db } from "@/lib/db";

const DISCOUNT_PCT = 0.20;
const DEALS_COUNT = 7;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDaySeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

export interface DealItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string | null;
  avgRating: number;
  stockCount: number;
  unlimitedStock: boolean;
  inStock: boolean;
  originalPrice: number;
  dealPrice: number;
  discountPct: number;
  savings: number;
}

export async function getDealsData(): Promise<{ deals: DealItem[]; resetAt: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true },
      select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
    }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;

    if (!products.length) return { deals: [], resetAt: new Date().toISOString() };

    const seed = getDaySeed();
    const shuffled = seededShuffle(products, seed);
    const selected = shuffled.slice(0, Math.min(DEALS_COUNT, shuffled.length));

    const deals: DealItem[] = selected.map((p) => {
      const originalPrice = Number(p.price);
      const dealPrice = Math.round(originalPrice * (1 - DISCOUNT_PCT) * 100) / 100;
      return {
        id: p.id, title: p.title, category: p.category, imageUrl: p.imageUrl,
        avgRating: Number(p.avgRating), stockCount: p.stockCount, unlimitedStock: p.unlimitedStock,
        inStock: p.unlimitedStock || p.stockCount > 0,
        originalPrice, dealPrice, discountPct: DISCOUNT_PCT * 100,
        savings: Math.round((originalPrice - dealPrice) * 100) / 100,
      };
    });

    const now = new Date();
    const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)).toISOString();

    return { deals, resetAt };
  } catch {
    return { deals: [], resetAt: new Date().toISOString() };
  }
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (db as any).siteSetting.findMany() as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
}
