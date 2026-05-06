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
import { getDealsData, getSiteSettings } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "MetraMart — Buy Netflix, Spotify & Digital Subscriptions at Best Prices",
  description: "MetraMart is your #1 digital marketplace. Buy Netflix, Spotify Premium, ChatGPT Plus, gaming keys and software licenses at unbeatable prices. Instant automated delivery worldwide.",
  keywords: ["buy netflix cheap", "spotify premium discount", "chatgpt plus cheap", "buy digital subscriptions", "instant delivery digital products", "cheap streaming services", "gaming keys", "software licenses", "metramart"],
  openGraph: {
    title: "MetraMart — Premium Digital Subscriptions at Unbeatable Prices",
    description: "Netflix, Spotify, ChatGPT Plus, gaming keys and more. Instant delivery, secure payments, best prices guaranteed.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "MetraMart",
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
  const [featured, streaming, aiTools, gaming, software, dealsData, siteSettings] = await Promise.all([
    getFeatured(),
    getProductsByCategory("STREAMING", 4),
    getProductsByCategory("AI_TOOLS", 4),
    getProductsByCategory("GAMING", 4),
    getProductsByCategory("SOFTWARE", 4),
    getDealsData(),
    getSiteSettings(),
  ]);

  const discordUrl = siteSettings["discord_url"] || process.env.DISCORD_SERVER_URL || "https://discord.gg/metramart";
  const telegramUrl = siteSettings["telegram_url"] || "";
  const discordMembers = siteSettings["discord_members"] || "1,000+";
  const telegramMembers = siteSettings["telegram_members"] || "";
  const dealsEnabled = siteSettings["deals_enabled"] !== "false";

  const hotDeals = dealsData.deals.slice(0, 4);
  const dealsResetAt = dealsData.resetAt;

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
          MetraMart is your trusted platform to buy cheap Netflix, Spotify, IPTV, and gaming subscriptions at the best prices.
          We provide instant delivery, secure payments, and reliable access to your favorite digital services worldwide.
          Whether you need a cheap Netflix subscription, affordable Spotify Premium, or discounted AI tools — we have it all.
        </p>
      </section>

      {/* Hot Deals strip — neon green vault theme */}
      {dealsEnabled && hotDeals.length > 0 && (
        <section className="py-16 relative" style={{ background: "rgba(10,7,0,0.7)", borderTop: "1px solid rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "#fbbf24" }}>
                    DEAL VAULT
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24" }}>
                      20% OFF
                    </span>
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(245,158,11,0.5)" }}>Vault refreshes daily at midnight UTC</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DealCountdown resetAt={dealsResetAt} />
                <Link href="/deals" className="flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-70"
                  style={{ color: "#fbbf24" }}>
                  View Vault <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {hotDeals.map((deal) => <DealCard key={deal.id} {...deal} />)}
            </div>
          </div>
        </section>
      )}

      {/* Community Section — Discord & Telegram */}
      <CommunitySection discordUrl={discordUrl} telegramUrl={telegramUrl} discordMembers={discordMembers} telegramMembers={telegramMembers} />

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Latest digital products</p>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors">
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
            <Link href={`/products?category=${section.id}`} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors">
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
          <h2 className="text-2xl font-bold text-white mb-2">Why Choose MetraMart?</h2>
          <p className="text-gray-500">Trusted by thousands of customers worldwide</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, color: "text-amber-400", title: "Instant Delivery", desc: "Credentials hit your inbox the moment payment confirms. Fully automated — no waiting, no manual steps, ever." },
            { icon: Lock, color: "text-green-400", title: "Secure & Encrypted", desc: "All inventory encrypted with AES-256-GCM. Payments processed through trusted crypto providers with zero data exposure." },
            { icon: Gem, color: "text-amber-300", title: "Unbeatable Prices", desc: "Get Netflix, Spotify, IPTV and more at prices far below official plans. We source in bulk and pass every saving to you." },
            { icon: Flame, color: "text-orange-400", title: "24/7 Live Support", desc: "Real humans on Discord around the clock. Open a ticket and get a response within minutes — not hours." },
            { icon: Zap, color: "text-amber-500", title: "4.7★ Customer Rating", desc: "Thousands of verified reviews from happy customers across 50+ countries. We deliver on every promise." },
            { icon: Lock, color: "text-emerald-400", title: "Replacement Guarantee", desc: "Every product is verified before listing. If anything goes wrong, we replace it — no questions asked." },
          ].map((item) => (
            <div key={item.title} className="glass-card p-6 text-center transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "rgba(245,158,11,0.08)" }}>
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
          Looking for cheap Netflix subscriptions or affordable Spotify Premium accounts? MetraMart offers some of the best deals online.
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
            <details key={item.q} className="group rounded-xl border border-white/8 glass-card hover:border-amber-500/20 transition-all">
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

