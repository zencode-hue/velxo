import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import { Star, ShoppingCart, Package } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

interface PageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  const product = await db.product.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      category: true,
      imageUrl: true,
      avgRating: true,
      stockCount: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!product) return null;

  const relatedProducts = await db.product.findMany({
    where: { category: product.category, isActive: true, id: { not: product.id } },
    take: 3,
    orderBy: { avgRating: "desc" },
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

  return {
    ...product,
    price: Number(product.price),
    avgRating: Number(product.avgRating),
    inStock: product.stockCount > 0,
    relatedProducts: relatedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      category: p.category,
      imageUrl: p.imageUrl,
      avgRating: Number(p.avgRating),
      stockCount: p.stockCount,
      inStock: p.stockCount > 0,
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await db.product.findFirst({
    where: { id: params.id, isActive: true },
    select: { title: true, description: true, imageUrl: true },
  });

  if (!product) {
    return { title: "Product Not Found — Velxo" };
  }

  return {
    title: `${product.title} — Velxo`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} — Velxo`,
      description: product.description.slice(0, 160),
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${params.id}`,
      siteName: "Velxo",
      type: "website",
      ...(product.imageUrl ? { images: [{ url: product.imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Velxo`,
      description: product.description.slice(0, 160),
    },
  };
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-600"
          }
        />
      ))}
      <span className="text-sm text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Product detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="relative aspect-video lg:aspect-square rounded-xl overflow-hidden bg-surface-2">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={64} className="text-gray-700" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge-purple">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
            {product.inStock ? (
              <span className="badge-green">In Stock ({product.stockCount})</span>
            ) : (
              <span className="badge-red">Out of Stock</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {product.title}
          </h1>

          <StarRating rating={product.avgRating} size={18} />

          <p className="text-gray-400 leading-relaxed">{product.description}</p>

          <div className="text-4xl font-bold text-white">
            ${product.price.toFixed(2)}
          </div>

          {product.inStock ? (
            <Link
              href={`/checkout?productId=${product.id}`}
              className="btn-primary text-base px-8 py-4 w-fit"
            >
              <ShoppingCart size={18} />
              Buy Now
            </Link>
          ) : (
            <button
              disabled
              className="btn-primary text-base px-8 py-4 w-fit opacity-50 cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-6">
            Reviews ({product.reviews.length})
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-xs font-semibold text-purple-400">
                      {review.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {review.user.name ?? "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-400">{review.comment}</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {product.relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.id} {...related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
