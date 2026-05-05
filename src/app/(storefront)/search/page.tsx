import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Products — MetraMart",
  description: "Search for digital products on MetraMart.",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "STREAMING", label: "Streaming" },
  { value: "AI_TOOLS", label: "AI Tools" },
  { value: "SOFTWARE", label: "Software" },
  { value: "GAMING", label: "Gaming" },
];

interface Props { searchParams: { q?: string; category?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category ?? "";

  // Build search — use multiple OR conditions for fuzzy-like matching
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = q.length > 0 ? await (db.product.findMany as any)({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      OR: words.length > 0 ? words.flatMap((word: string) => [
        { title: { contains: word, mode: "insensitive" } },
        { description: { contains: word, mode: "insensitive" } },
      ]) : [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ avgRating: "desc" }, { stockCount: "desc" }],
    take: 40,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }> : [];

  // If no results and query has typos, try broader search (first 3 chars of each word)
  let mapped = products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));

  // Fuzzy fallback — if no results, try partial match on first 3 chars
  if (mapped.length === 0 && q.length >= 3) {
    const partial = q.slice(0, 3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallback = await (db.product.findMany as any)({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        title: { contains: partial, mode: "insensitive" },
      },
      orderBy: { avgRating: "desc" },
      take: 20,
      select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
    }) as typeof products;
    mapped = fallback.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <form method="GET" action="/search" className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input name="q" defaultValue={q} placeholder="Search products..."
              className="input-field pl-11 text-base" autoFocus />
            {category && <input type="hidden" name="category" value={category} />}
          </div>
          <button type="submit" className="btn-primary px-6 py-3 text-sm">Search</button>
        </form>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-gray-500" />
          {CATEGORIES.map((cat) => (
            <Link key={cat.value}
              href={`/search?q=${encodeURIComponent(q)}&category=${cat.value}`}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: category === cat.value ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                border: category === cat.value ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
                color: category === cat.value ? "#c4b5fd" : "rgba(255,255,255,0.5)",
              }}>
              {cat.label}
            </Link>
          ))}
        </div>

        {q && (
          <p className="text-gray-500 text-sm">
            {mapped.length} result{mapped.length !== 1 ? "s" : ""} for &quot;{q}&quot;
            {category && ` in ${CATEGORIES.find(c => c.value === category)?.label}`}
          </p>
        )}
      </div>

      {q === "" ? (
        <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Type something to search</p>
          <Link href="/products" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">Browse all products →</Link>
        </div>
      ) : mapped.length === 0 ? (
        <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>
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
