import type { Metadata } from "next";
import { Category } from "@prisma/client";
import { db } from "@/lib/db";
import ProductGrid from "@/components/storefront/ProductGrid";
import type { CategoryOption } from "@/components/storefront/CategoryNav";

export const metadata: Metadata = {
  title: "Products — Velxo",
  description:
    "Browse all digital products on Velxo — streaming subscriptions, AI tools, software licenses, and gaming products with instant delivery.",
  openGraph: {
    title: "Products — Velxo",
    description:
      "Browse all digital products on Velxo — streaming subscriptions, AI tools, software licenses, and gaming products with instant delivery.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
    siteName: "Velxo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products — Velxo",
    description:
      "Browse all digital products on Velxo — streaming subscriptions, AI tools, software licenses, and gaming products with instant delivery.",
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

  const products = await db.product.findMany({
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
    },
  });

  return products.map((p: typeof products[number]) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    category: p.category,
    imageUrl: p.imageUrl,
    avgRating: Number(p.avgRating),
    stockCount: p.stockCount,
    inStock: p.stockCount > 0,
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
