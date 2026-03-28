import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";

export const metadata: Metadata = {
  title: "Hot Deals — Velxo",
  description: "Best deals on digital products — streaming, AI tools, software, and gaming.",
};

export default async function DealsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where: { isActive: true, price: { lte: 16 } },
    orderBy: { price: "asc" },
    take: 24,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;

  const mapped = products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4">🔥</div>
        <h1 className="text-4xl font-bold text-white mb-3">Hot Deals</h1>
        <p className="text-gray-500">Best value digital products under $16</p>
      </div>
      {mapped.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No deals available right now. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mapped.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
}
