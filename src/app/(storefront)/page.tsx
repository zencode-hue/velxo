import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import HeroSection from "@/components/storefront/HeroSection";
import ProductGrid from "@/components/storefront/ProductGrid";
import { Tv, Bot, Package, Gamepad2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Velxo — Premium Digital Marketplace",
  description:
    "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  openGraph: {
    title: "Velxo — Premium Digital Marketplace",
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Velxo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velxo — Premium Digital Marketplace",
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  },
};

async function getFeaturedProducts() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where: { isActive: true },
    orderBy: { avgRating: "desc" },
    take: 8,
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

const categories = [
  {
    id: "STREAMING",
    label: "Streaming",
    description: "Netflix, Spotify, Disney+ and more",
    icon: <Tv size={28} className="text-purple-400" />,
  },
  {
    id: "AI_TOOLS",
    label: "AI Tools",
    description: "ChatGPT, Midjourney, and top AI subscriptions",
    icon: <Bot size={28} className="text-purple-400" />,
  },
  {
    id: "SOFTWARE",
    label: "Software",
    description: "Licenses for productivity and creative tools",
    icon: <Package size={28} className="text-purple-400" />,
  },
  {
    id: "GAMING",
    label: "Gaming",
    description: "Game keys, credits, and subscriptions",
    icon: <Gamepad2 size={28} className="text-purple-400" />,
  },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Top-rated digital products</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Browse by Category</h2>
          <p className="text-gray-500">Find exactly what you need</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="glass-card-hover p-6 flex flex-col gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-600 group-hover:text-purple-400 transition-colors mt-auto"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Why Choose Velxo?</h2>
          <p className="text-gray-500">Everything you need, nothing you don&apos;t</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Instant Delivery",
              desc: "Your credentials are delivered automatically to your email the moment payment is confirmed. No waiting, no manual processing.",
            },
            {
              icon: "🔒",
              title: "Secure & Encrypted",
              desc: "All inventory is encrypted with AES-256-GCM. Your data is safe and payments are processed through trusted providers.",
            },
            {
              icon: "💎",
              title: "Premium Quality",
              desc: "Every product is verified before listing. We stand behind the quality of everything in our catalog.",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "How does delivery work?",
              a: "After your payment is confirmed, your digital product (credentials, license key, etc.) is automatically sent to your registered email address.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept crypto payments via NOWPayments (BTC, ETH, USDT, and 100+ coins) and manual payments via Discord.",
            },
            {
              q: "What if I have an issue with my order?",
              a: "Join our Discord server and open a support ticket. Our team will resolve any issues promptly.",
            },
            {
              q: "Are the products legitimate?",
              a: "Yes. All products are sourced and verified before being listed. We maintain high quality standards across our catalog.",
            },
          ].map((item) => (
            <div key={item.q} className="glass-card p-5">
              <h3 className="font-semibold text-white mb-2 text-sm">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
