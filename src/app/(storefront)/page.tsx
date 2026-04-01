import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import HeroSection from "@/components/storefront/HeroSection";
import ProductCard from "@/components/storefront/ProductCard";
import FeaturedCategories from "@/components/storefront/FeaturedCategories";
import TrustBadges from "@/components/storefront/TrustBadges";
import NewsletterSection from "@/components/storefront/NewsletterSection";
import { ArrowRight, Zap, Lock, Gem, Flame } from "lucide-react";
import DealCard from "@/components/storefront/DealCard";
import DealCountdown from "@/components/storefront/DealCountdown";

export const metadata: Metadata = {
  title: "Velxo Shop - Buy Digital Products Instantly",
  description: "Buy Netflix, Spotify, ChatGPT Plus, gaming keys, AI tools and software licenses. Instant automated delivery. Secure crypto & card payments.",
  openGraph: {
    title: "Velxo Shop - Buy Digital Products Instantly",
    description: "Buy Netflix, Spotify, ChatGPT Plus, gaming keys, AI tools and software licenses. Instant automated delivery.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Velxo Shop",
    type: "website",
  },
};

async function getProductsByCategory(category: string, take = 4) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where: { isActive: true, category },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;
  return products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));
}

async function getFeatured() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, title: true, price: true, category: true, imageUrl: true, avgRating: true, stockCount: true, unlimitedStock: true },
  }) as Array<{ id: string; title: string; price: { toString(): string }; category: string; imageUrl: string | null; avgRating: { toString(): string }; stockCount: number; unlimitedStock: boolean }>;
  return products.map((p) => ({
    id: p.id, title: p.title, price: Number(p.price), category: p.category,
    imageUrl: p.imageUrl, avgRating: Number(p.avgRating), stockCount: p.stockCount,
    unlimitedStock: p.unlimitedStock, inStock: p.unlimitedStock || p.stockCount > 0,
  }));
}

export default async function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [featured, streaming, aiTools, gaming, software, dealsRes] = await Promise.all([
    getFeatured(),
    getProductsByCategory("STREAMING", 4),
    getProductsByCategory("AI_TOOLS", 4),
    getProductsByCategory("GAMING", 4),
    getProductsByCategory("SOFTWARE", 4),
    fetch(`${appUrl}/api/v1/deals`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: null })),
  ]);

  const hotDeals = (dealsRes?.data?.deals ?? []).slice(0, 4) as Array<{
    id: string; title: string; category: string; imageUrl: string | null;
    originalPrice: number; dealPrice: number; discountPct: number;
    savings: number; inStock: boolean; avgRating: number;
  }>;
  const dealsResetAt: string = dealsRes?.data?.resetAt ?? new Date().toISOString();

  const categorySections = [
    { id: "STREAMING", label: "Streaming", products: streaming },
    { id: "AI_TOOLS", label: "AI Tools", products: aiTools },
    { id: "GAMING", label: "Gaming", products: gaming },
    { id: "SOFTWARE", label: "Software", products: software },
  ].filter((s) => s.products.length > 0);

  return (
    <>
      <HeroSection />
      <TrustBadges />

      {/* Hot Deals strip — neon green vault theme */}
      {hotDeals.length > 0 && (
        <section className="py-16" style={{ background: "rgba(0,10,5,0.6)", borderTop: "1px solid rgba(0,255,136,0.1)", borderBottom: "1px solid rgba(0,255,136,0.1)" }}>
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.008) 2px, rgba(0,255,136,0.008) 4px)" }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black font-mono flex items-center gap-2" style={{ color: "#00ff88" }}>
                    DEAL VAULT
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full font-mono"
                      style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.35)", color: "#00ff88" }}>
                      20% OFF
                    </span>
                  </h2>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(0,255,136,0.5)" }}>Vault refreshes daily at midnight UTC</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DealCountdown resetAt={dealsResetAt} neon />
                <Link href="/deals" className="flex items-center gap-1.5 text-sm font-mono font-bold transition-colors hover:opacity-70"
                  style={{ color: "#00ff88" }}>
                  View Vault <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hotDeals.map((deal) => <DealCard key={deal.id} {...deal} neon />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Latest digital products</p>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}

      {/* Category sections */}
      {categorySections.map((section) => (
        <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{section.label}</h2>
            <Link href={`/products?category=${section.id}`} className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {section.products.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      ))}

      <FeaturedCategories />

      {/* Why choose us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Why Choose Velxo Shop?</h2>
          <p className="text-gray-500">Everything you need, nothing you don&apos;t</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Zap, color: "text-yellow-400", title: "Instant Delivery", desc: "Credentials delivered automatically to your email the moment payment confirms. No waiting." },
            { icon: Lock, color: "text-green-400", title: "Secure & Encrypted", desc: "All inventory encrypted with AES-256-GCM. Payments processed through trusted providers." },
            { icon: Gem, color: "text-[#fbbf24]", title: "Premium Quality", desc: "Every product verified before listing. We stand behind everything in our catalog." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/8 bg-[#1a1208] p-6 text-center hover:border-[#ea580c]/30 transition-colors">
              <div className="flex justify-center mb-4">
                <item.icon size={36} className={item.color} />
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <NewsletterSection />

      {/* SEO content block */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/5 text-center">
        <p className="text-sm text-gray-500 leading-relaxed">
          Velxo Shop is your trusted digital products shop for streaming subscriptions, AI tools, software licenses, and gaming keys.
          Our shop offers instant automated delivery — the moment your payment confirms, your credentials land in your inbox.
          Whether you&apos;re looking to buy a Netflix account, Spotify Premium, ChatGPT Plus, or any other digital product,
          Velxo Shop has you covered with competitive prices, daily deals, and a secure checkout.
          Browse our shop today and get your digital products delivered in seconds.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "How does delivery work?", a: "After payment confirms, your digital product is automatically sent to your registered email. Instant, no manual steps." },
            { q: "What payment methods do you accept?", a: "Crypto via NOWPayments (BTC, ETH, USDT, 100+ coins), Discord manual payment, and wallet balance." },
            { q: "What if I have an issue?", a: "Join our Discord and open a support ticket. We resolve issues promptly." },
            { q: "Are the products legitimate?", a: "Yes. All products are sourced and verified before listing." },
          ].map((item) => (
            <details key={item.q} className="group rounded-xl border border-white/8 bg-[#1a1208] hover:border-purple-600/20 transition-all">
              <summary className="p-5 cursor-pointer font-semibold text-white text-sm flex items-center justify-between list-none">
                {item.q}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

