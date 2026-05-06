import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Shield, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — MetraMart",
  description: "Learn about MetraMart, the premium digital marketplace for streaming, AI tools, software, and gaming products.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #ea580c, #fbbf24)" }}>
          <Zap size={28} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">About MetraMart</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          We&apos;re a premium digital marketplace built to make buying digital products fast, safe, and effortless.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Zap, title: "Instant Delivery", desc: "Every order is delivered automatically within seconds of payment confirmation.", color: "text-yellow-400" },
          { icon: Shield, title: "Secure & Trusted", desc: "All credentials are encrypted with AES-256-GCM. Your data is always safe.", color: "text-green-400" },
          { icon: Users, title: "10,000+ Customers", desc: "Thousands of happy customers across 50+ countries trust MetraMart daily.", color: "text-blue-400" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl p-6 text-center" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <item.icon size={28} className={`${item.color} mx-auto mb-3`} />
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-8 mb-12" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          MetraMart was founded with a simple mission: make premium digital products accessible to everyone, delivered instantly, at fair prices.
        </p>
        <p className="text-gray-400 leading-relaxed mb-4">
          We source and verify every product before listing it. Our automated delivery system means you get your credentials the moment your payment clears — no waiting, no manual processing, no hassle.
        </p>
        <p className="text-gray-400 leading-relaxed">
          We accept crypto payments (BTC, ETH, USDT, and 100+ coins) and Discord manual payments, making us accessible to customers worldwide regardless of their banking situation.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { value: "500+", label: "Products" },
          { value: "10k+", label: "Orders Delivered" },
          { value: "50+", label: "Countries" },
          { value: "4.8★", label: "Avg Rating" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 text-center" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-2xl font-black mb-1" style={{ background: "linear-gradient(135deg, #fbbf24, #ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
          <Star size={16} /> Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

