import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DollarSign, Users, Zap, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Program — Velxo",
  description: "Earn 10% commission on every sale you refer. Join the Velxo affiliate program today.",
};

export default function AffiliatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-purple-300 mb-6"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <DollarSign size={14} /> Affiliate Program
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Earn Money by Sharing{" "}
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Velxo
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Get a unique referral link at <strong className="text-white">velxo.shop</strong> and earn 10% commission on every sale you refer. No limits, instant tracking.
        </p>
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          Join Now — It&apos;s Free <ArrowRight size={18} />
        </Link>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "1", icon: Users, title: "Sign Up", desc: "Create a free account and join the affiliate program from your dashboard with one click." },
            { step: "2", icon: Share2, title: "Share Your Link", desc: "Get your unique velxo.shop referral link and share it on social media, YouTube, or your website." },
            { step: "3", icon: DollarSign, title: "Earn Commission", desc: "Earn 10% on every purchase made through your link. Commissions are tracked in real-time." },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-white/8 bg-[#111111] p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                {item.step}
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {[
          { value: "10%", label: "Commission Rate" },
          { value: "Instant", label: "Tracking" },
          { value: "No Limit", label: "Earnings Cap" },
          { value: "Free", label: "To Join" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 bg-[#111111] p-5 text-center">
            <div className="text-2xl font-bold mb-1"
              style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/8 bg-[#111111] p-8 mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Why Affiliate with Velxo?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Zap, text: "Real-time commission tracking in your dashboard" },
            { icon: DollarSign, text: "Use earnings as store balance to buy products" },
            { icon: Share2, text: "Unique velxo.shop/auth/register?ref=[code] link" },
            { icon: Users, text: "No minimum payout threshold" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon size={16} className="text-purple-400 shrink-0" />
              <span className="text-sm text-gray-400">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
          Start Earning Today <ArrowRight size={18} />
        </Link>
        <p className="text-xs text-gray-600 mt-3">
          Already have an account?{" "}
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">Go to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
