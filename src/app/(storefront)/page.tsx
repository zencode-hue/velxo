import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import HeroSection from "@/components/storefront/HeroSection";
import ProductCard from "@/components/storefront/ProductCard";
import FeaturedCategories from "@/components/storefront/FeaturedCategories";
import TrustBadges from "@/components/storefront/TrustBadges";
import NewsletterSection from "@/components/storefront/NewsletterSection";
import CommunitySection from "@/components/storefront/CommunitySection";
import LiveOrderTicker from "@/components/storefront/LiveOrderTicker";
import { ArrowRight, Zap, Lock, Gem, Flame } from "lucide-react";
import DealCard from "@/components/storefront/DealCard";
import DealCountdown from "@/components/storefront/DealCountdown";

export const metadata: Metadata = {
  title: "Velxo Shop - Cheap Netflix, Spotify & Digital Subscriptions",
  description: "Buy cheap Netflix, Spotify Premium, IPTV, ChatGPT Plus, gaming keys and software licenses at the best prices. Instant automated delivery. Secure payments worldwide.",
  keywords: ["cheap netflix subscription", "buy spotify premium cheap", "affordable IPTV", "cheap streaming services", "buy digital products", "instant delivery subscriptions"],
  openGraph: {
    title: "Velxo Shop - Cheap Netflix, Spotify & Digital Subscriptions",
    description: "Buy cheap Netflix, Spotify Premium, IPTV, ChatGPT Plus, gaming keys and software licenses. Instant delivery, secure payments.",
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
  const [featured, streaming, aiTools, gaming, software, dealsRes, settingsRes] = await Promise.all([
    getFeatured(),
    getProductsByCategory("STREAMING", 4),
    getProductsByCategory("AI_TOOLS", 4),
    getProductsByCategory("GAMING", 4),
    getProductsByCategory("SOFTWARE", 4),
    fetch(`${appUrl}/api/v1/deals`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: null })),
    fetch(`${appUrl}/api/v1/settings`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: {} })),
  ]);

  const siteSettings: Record<string, string> = settingsRes?.data ?? {};
  const discordUrl = siteSettings["discord_url"] || process.env.DISCORD_SERVER_URL || "https://discord.gg/velxo";
  const telegramUrl = siteSettings["telegram_url"] || "";
  const dealsEnabled = siteSettings["deals_enabled"] !== "false";

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
      <LiveOrderTicker />

      {/* ── Section 1: Intro / value prop — visually hidden, SEO only ── */}
      <section className="sr-only" aria-hidden="false">
        <h2>Affordable Premium Subscriptions in One Place</h2>
        <p>
          Velxo Shop is your trusted platform to buy cheap Netflix, Spotify, IPTV, and gaming subscriptions at the best prices.
          We provide instant delivery, secure payments, and reliable access to your favorite digital services worldwide.
          Whether you need a cheap Netflix subscription, affordable Spotify Premium, or discounted AI tools — we have it all.
        </p>
      </section>

      {/* Hot Deals strip — neon green vault theme */}
      {dealsEnabled && hotDeals.length > 0 && (
        <section className="py-16" style={{ background: "rgba(0,10,5,0.6)", borderTop: "1px solid rgba(0,255,136,0.1)", borderBottom: "1px solid rgba(0,255,136,0.1)" }}>
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

      {/* Community Section — Discord & Telegram */}
      <CommunitySection discordUrl={discordUrl} telegramUrl={telegramUrl} />

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
            <h2 className="text-xl font-bold text-white">Top {section.label} Products</h2>
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

      {/* ── Section 2: Why Choose Us ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Why Choose Velxo Shop?</h2>
          <p className="text-gray-500">Everything you need, nothing you don&apos;t</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, color: "text-yellow-400", title: "Instant Delivery", desc: "Credentials delivered automatically to your email the moment payment confirms. No waiting, no manual steps." },
            { icon: Lock, color: "text-green-400", title: "Secure & Safe Transactions", desc: "All inventory encrypted with AES-256-GCM. Payments processed through trusted crypto providers." },
            { icon: Gem, color: "text-[#fbbf24]", title: "Affordable Prices", desc: "Get cheap Netflix, Spotify, IPTV and more at prices far below official plans. Best value guaranteed." },
            { icon: Flame, color: "text-orange-400", title: "24/7 Customer Support", desc: "Our team is available on Discord around the clock. Open a ticket and get help within minutes." },
            { icon: Zap, color: "text-blue-400", title: "Trusted by Thousands", desc: "Over 10,000 orders delivered to happy customers across 50+ countries worldwide." },
            { icon: Lock, color: "text-purple-400", title: "Premium Quality Products", desc: "Every product is verified before listing. We stand behind everything in our catalog with a replacement guarantee." },
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

      {/* ── Section 3: Main Keywords — visually hidden, SEO only ── */}
      <section className="sr-only" aria-hidden="false">
        <h2>Cheap Netflix, Spotify &amp; IPTV Subscriptions</h2>
        <p>
          Looking for cheap Netflix subscriptions or affordable Spotify Premium accounts? Velxo Shop offers some of the best deals online.
          Whether you want IPTV for unlimited channels or discounted streaming services, we provide high-quality access at unbeatable prices.
          Our shop specializes in cheap digital subscriptions — from Netflix and Spotify to ChatGPT Plus, gaming keys, and AI tools.
          All products come with instant automated delivery and a replacement guarantee, making us the most reliable place to buy affordable streaming services.
        </p>
      </section>

      {/* ── Section 4: How It Works — visually hidden, SEO only ── */}
      <section className="sr-only" aria-hidden="false">
        <h2>How It Works</h2>
        <ol>
          <li>Choose your subscription from our shop</li>
          <li>Make a secure payment with crypto or gift card</li>
          <li>Receive your account credentials instantly by email</li>
          <li>Start streaming immediately</li>
        </ol>
      </section>

      <NewsletterSection />

      {/* ── Section 5: FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "Are your subscriptions safe?", a: "Yes, we provide secure and tested accounts for all services. Every product is verified before listing and comes with a replacement guarantee if anything goes wrong." },
            { q: "How fast is delivery?", a: "Most orders are delivered instantly after payment confirms. Our automated system sends credentials to your email within seconds — no waiting, no manual processing." },
            { q: "Do you offer refunds?", a: "Yes. In case of issues with your order, we provide support and a replacement or refund. Contact us on Discord within 24 hours of purchase." },
            { q: "How does delivery work?", a: "After payment confirms, your digital product credentials are automatically sent to your registered email. Instant, no manual steps required." },
            { q: "What payment methods do you accept?", a: "We accept crypto via NOWPayments (BTC, ETH, USDT, 100+ coins), Binance gift cards, Discord manual payment, and wallet balance." },
            { q: "Why are your prices cheaper than official plans?", a: "We source subscriptions in bulk and pass the savings on to you. All products are legitimate and fully functional." },
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

