import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Products — Velxo Shop",
  description: "Search for digital products on Velxo Shop.",
  robots: { index: false, follow: false },
};

interface Props { searchParams: { q?: string; category?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = q.length > 0 ? await (db.product.findMany as any)({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { avgRating: "desc" },
    take: 40,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }> : [];

  const mapped = products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <form method="GET" action="/search" className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input name="q" defaultValue={q} placeholder="Search products..."
              className="input-field pl-11 text-base" autoFocus />
          </div>
          <button type="submit" className="btn-primary px-6 py-3 text-sm">Search</button>
        </form>
        {q && <p className="text-gray-500 text-sm mt-3">{mapped.length} result{mapped.length !== 1 ? "s" : ""} for &quot;{q}&quot;</p>}
      </div>

      {q === "" ? (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Type something to search</p>
          <Link href="/products" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">Browse all products →</Link>
        </div>
      ) : mapped.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No results for &quot;{q}&quot;</p>
          <p className="text-sm">Try a different search term or <Link href="/products" className="text-purple-400">browse all products</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mapped.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
}
