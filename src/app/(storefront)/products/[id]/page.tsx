import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import ProductActions from "./ProductActions";
import PriceDisplay from "@/components/storefront/PriceDisplay";
import UrgencyBadges from "@/components/storefront/UrgencyBadges";
import { Star, Package, CheckCircle, Zap, Shield, RefreshCw } from "lucide-react";
import { extractProductId, productPath } from "@/lib/slug";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};
const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-red-400 bg-red-500/10 border-red-500/20",
  AI_TOOLS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SOFTWARE: "text-green-400 bg-green-500/10 border-green-500/20",
  GAMING: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

// Generate feature bullets from description
function getFeatures(description: string, category: string): string[] {
  const base = [
    "1 year subscription — valid for 12 full months",
    "Instant automated delivery to your email",
    "AES-256 encrypted credentials",
    "Replacement guarantee if invalid",
    "24/7 customer support",
  ];
  const catFeatures: Record<string, string[]> = {
    STREAMING: ["HD/4K streaming quality", "Multi-device access", "Offline downloads available", "Ad-free experience"],
    AI_TOOLS: ["Unlimited message access", "Latest AI model included", "API access available", "Priority processing"],
    SOFTWARE: ["Full license key included", "All features unlocked", "Regular updates included", "Works on all platforms"],
    GAMING: ["Instant account/key delivery", "All DLC included", "Multi-platform support", "No region restrictions"],
  };
  return ["1 year subscription — valid for 12 full months", ...(catFeatures[category] ?? []), ...base.slice(1)].slice(0, 7);
}

interface PageProps { params: { id: string } }

type ReviewItem = { id: string; rating: number; comment: string | null; createdAt: Date; user: { name: string | null } };

async function getProduct(id: string) {
  const realId = extractProductId(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (db.product.findFirst as any)({
    where: { id: realId, isActive: true },
    select: {
      id: true, title: true, description: true, price: true, category: true,
      imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
      },
    },
  }) as ({ id: string; title: string; description: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean; reviews: ReviewItem[] } | null);

  if (!product) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = await (db.product.findMany as any)({
    where: { category: product.category, isActive: true, id: { not: product.id } },
    take: 4, orderBy: { avgRating: "desc" },
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;

  return {
    ...product,
    price: Number(product.price),
    avgRating: Number(product.avgRating),
    inStock: product.unlimitedStock || product.stockCount > 0,
    relatedProducts: related.map((p) => ({
      id: p.id, title: p.title, price: Number(p.price), category: p.category,
      imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
      unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const realId = extractProductId(params.id);
  const product = await db.product.findFirst({
    where: { id: realId, isActive: true },
    select: { title: true, description: true, imageUrl: true, price: true, avgRating: true },
  });
  if (!product) return { title: "Product Not Found - Velxo Shop" };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
  const slugUrl = `${appUrl}${productPath(realId, product.title)}`;
  return {
    title: `${product.title} - Velxo Shop`,
    description: product.description.slice(0, 160),
    alternates: { canonical: slugUrl },
    openGraph: {
      title: `${product.title} - Velxo Shop`,
      description: product.description.slice(0, 160),
      url: slugUrl,
      siteName: "Velxo Shop", type: "website",
      ...(product.imageUrl ? { images: [{ url: product.imageUrl }] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const features = getFeatures(product.description, product.category);
  const catColor = CATEGORY_COLORS[product.category] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const reviewCount = product.reviews.length;
  const avgRating = product.avgRating;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.imageUrl ?? undefined,
    url: `${appUrl}${productPath(product.id, product.title)}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${appUrl}${productPath(product.id, product.title)}`,
      seller: { "@type": "Organization", name: "Velxo Shop" },
    },
    ...(avgRating > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviewCount > 0 ? reviewCount : 1,
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-6">
        <a href="/" className="hover:text-gray-400 transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-gray-400 transition-colors">Products</a>
        <span>/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-gray-400 transition-colors">{CATEGORY_LABELS[product.category]}</a>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Left — Image */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Package size={64} className="text-purple-400/40" />
                <span className="text-gray-600 text-sm">{CATEGORY_LABELS[product.category]}</span>
              </div>
            )}
            {/* Best seller badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
                🔥 BEST SELLER
              </span>
            </div>
          </div>

          {/* Trust badges under image */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "Instant Delivery", color: "text-yellow-400" },
              { icon: Shield, label: "Secure Payment", color: "text-green-400" },
              { icon: RefreshCw, label: "Replacement Guarantee", color: "text-blue-400" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <b.icon size={16} className={b.color} />
                <span className="text-xs text-gray-500 leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col gap-5">
          {/* Category + stock */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
              {CATEGORY_LABELS[product.category]}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${product.inStock ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-red-400 bg-red-500/10 border-red-500/30"}`}>
              {product.inStock && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              {product.inStock ? "Available" : "Out of Stock"}
            </span>
            {product.inStock && !product.unlimitedStock && (
              <span className="text-xs text-gray-500">{product.stockCount} in stock</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} className={s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
              ))}
            </div>
            <span className="text-sm text-yellow-400 font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white"><PriceDisplay usdAmount={product.price} /></span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>USD base</span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

          {/* SEO keyword content — hidden visually, readable by Google */}
          <div className="sr-only" aria-hidden="false">
            <p>
              Get access to {product.title} at a lower cost with our affordable subscription plans on Velxo Shop.
              Enjoy premium {CATEGORY_LABELS[product.category] ?? "digital"} access without paying full price.
              Our service is fast, reliable, and easy to use — credentials are delivered instantly after payment with no waiting.
              This is one of the best cheap {CATEGORY_LABELS[product.category]?.toLowerCase() ?? "digital"} deals available online.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Features & Benefits:</p>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions — client component */}
          <UrgencyBadges productId={product.id} stockCount={product.stockCount} unlimitedStock={product.unlimitedStock} />
          <ProductActions productId={product.id} productTitle={product.title} price={product.price} inStock={product.inStock} />
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
                      {review.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm font-medium text-white">{review.user.name ?? "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-400">{review.comment}</p>}
                <p className="text-xs text-gray-600 mt-2">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {product.relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {product.relatedProducts.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
