import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";

const DISCOUNT_PCT = 0.20; // 20% off
const DEALS_COUNT = 7; // 5-8, we use 7

// Seeded shuffle — same order all day, resets at midnight UTC
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
  // Seed = YYYYMMDD as integer
  return (
    now.getUTCFullYear() * 10000 +
    (now.getUTCMonth() + 1) * 100 +
    now.getUTCDate()
  );
}

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await (db.product.findMany as any)({
      where: { isActive: true },
      select: {
        id: true, title: true, price: true, category: true,
        imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true,
      },
    }) as Array<{
      id: string; title: string;
      price: { toString(): string };
      category: string; imageUrl: string | null;
      avgRating: { toString(): string };
      stockCount: number; unlimitedStock: boolean;
    }>;

    if (!products.length) return NextResponse.json({ data: { deals: [], resetAt: null }, error: null });

    const seed = getDaySeed();
    const shuffled = seededShuffle(products, seed);
    const selected = shuffled.slice(0, Math.min(DEALS_COUNT, shuffled.length));

    const deals = selected.map((p) => {
      const originalPrice = Number(p.price);
      const dealPrice = Math.round(originalPrice * (1 - DISCOUNT_PCT) * 100) / 100;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        imageUrl: p.imageUrl,
        avgRating: Number(p.avgRating),
        stockCount: p.stockCount,
        unlimitedStock: p.unlimitedStock,
        inStock: p.unlimitedStock || p.stockCount > 0,
        originalPrice,
        dealPrice,
        discountPct: DISCOUNT_PCT * 100,
        savings: Math.round((originalPrice - dealPrice) * 100) / 100,
      };
    });

    // Next reset = midnight UTC
    const now = new Date();
    const resetAt = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    )).toISOString();

    return NextResponse.json({ data: { deals, resetAt }, error: null });
  } catch (err) {
    console.error("[GET /api/v1/deals]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
