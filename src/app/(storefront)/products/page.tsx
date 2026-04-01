import type { Metadata } from "next";
import { Category } from "@prisma/client";
import { db } from "@/lib/db";
import ProductGrid from "@/components/storefront/ProductGrid";
import type { CategoryOption } from "@/components/storefront/CategoryNav";

export const metadata: Metadata = {
  title: "All Products — Velxo Shop",
  description: "Browse 500+ digital products on Velxo Shop — Netflix, Spotify, ChatGPT Plus, gaming keys, AI tools and software licenses. Instant delivery.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop"}/products`,
  },
  openGraph: {
    title: "All Products — Velxo Shop",
    description: "Browse 500+ digital products — streaming, AI tools, software, gaming. Instant delivery.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
    siteName: "Velxo Shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products — Velxo Shop",
    description: "Browse 500+ digital products — streaming, AI tools, software, gaming. Instant delivery.",
  },
};

const VALID_CATEGORIES: CategoryOption[] = [
  "STREAMING",
  "AI_TOOLS",
  "SOFTWARE",
  "GAMING",
];

async function getAllProducts(category?: string) {
  const where: { isActive: boolean; category?: Category } = { isActive: true };

  if (category && VALID_CATEGORIES.includes(category as CategoryOption)) {
    where.category = category as Category;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      price: true,
      category: true,
      imageUrl: true,
      avgRating: true,
      stockCount: true,
      unlimitedStock: true,
    },
  }) as Array<{
    id: string; title: string; price: { toString(): string }; category: string;
    imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean;
  }>;

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    category: p.category,
    imageUrl: p.imageUrl,
    avgRating: Number(p.avgRating),
    stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock,
    inStock: p.unlimitedStock || p.stockCount > 0,
  }));
}

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = searchParams;
  const products = await getAllProducts(category);

  const initialCategory: CategoryOption =
    category && VALID_CATEGORIES.includes(category as CategoryOption)
      ? (category as CategoryOption)
      : "ALL";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">All Products</h1>
        <p className="text-gray-500 mt-1">
          {products.length} product{products.length !== 1 ? "s" : ""} available
        </p>
      </div>
      <ProductGrid products={products} initialCategory={initialCategory} />
    </div>
  );
}
