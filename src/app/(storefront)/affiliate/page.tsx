import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DollarSign, Users, Zap, Share2, Handshake, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Program — Velxo",
  description: "Earn commission on every sale you refer. Join the Velxo affiliate program today.",
};

const G = "rgba(255,255,255,0.04)";
const B = "rgba(255,255,255,0.07)";
const BORDER = "rgba(255,255,255,0.08)";

export default function AffiliatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#c4b5fd" }}>
          <DollarSign size={13} /> Two Affiliate Programs
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
          Earn by Sharing<br />
          <span style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Velxo
          </span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
          Two ways to earn — store credit for casual referrers, real crypto payouts for serious partners.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: "rgba(167,139,250,0.14)", border: "1px solid rgba(167,139,250,0.28)", boxShadow: "0 0 20px rgba(167,139,250,0.1)" }}>
            Join Promo Affiliate <ArrowRight size={15} />
          </Link>
          <Link href="/dashboard/partner"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Apply as Partner <Handshake size={15} />
          </Link>
        </div>
      </div>

      {/* Two program cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
        {/* Promo */}
        <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: G, border: `1px solid ${BORDER}` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: "#a78bfa" }} />
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <Users size={20} style={{ color: "#c4b5fd" }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Promo Affiliate</h2>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Share your link, earn store credit on every referred purchase. Perfect for casual sharing.
            </p>
            <div className="space-y-2 mb-6">
              {["10% commission as store credit", "Instant tracking in dashboard", "No minimum threshold", "Use credit to buy any product"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa", flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <div className="text-2xl font-black text-white">10% <span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>store credit</span></div>
          </div>
        </div>

        {/* Partner */}
        <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: G, border: `1px solid ${BORDER}` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: "#34d399" }} />
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <TrendingUp size={20} style={{ color: "#6ee7b7" }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Partner Program</h2>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Apply to become a partner. Earn real cash paid directly to your crypto wallet.
            </p>
            <div className="space-y-2 mb-6">
              {["15%+ commission in real cash", "Crypto wallet payouts (BTC, ETH, USDT)", "Custom commission rates", "Dedicated partner dashboard"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399", flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <div className="text-2xl font-black text-white">15%+ <span className="text-sm font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>crypto payout</span></div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { step: "01", icon: Users, title: "Sign Up Free", desc: "Create an account and join the affiliate program from your dashboard in one click." },
            { step: "02", icon: Share2, title: "Share Your Link", desc: "Get your unique referral link and share it anywhere — social media, YouTube, Discord." },
            { step: "03", icon: DollarSign, title: "Earn Rewards", desc: "Earn commission on every purchase made through your link. Tracked in real-time." },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl p-6" style={{ background: G, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{item.step}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <item.icon size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                </div>
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {[
          { value: "10–15%", label: "Commission Rate" },
          { value: "Real-time", label: "Tracking" },
          { value: "No Cap", label: "Earnings Limit" },
          { value: "Free", label: "To Join" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 text-center" style={{ background: G, border: `1px solid ${BORDER}` }}>
            <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Why */}
      <div className="rounded-2xl p-8 mb-16" style={{ background: G, border: `1px solid ${BORDER}` }}>
        <h2 className="text-xl font-bold text-white mb-6">Why Affiliate with Velxo?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Zap, text: "Real-time commission tracking in your dashboard" },
            { icon: DollarSign, text: "Promo earnings usable as store balance instantly" },
            { icon: Share2, text: "Unique referral link — easy to share anywhere" },
            { icon: TrendingUp, text: "Partner program pays real crypto — no limits" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: B, border: `1px solid ${BORDER}` }}>
              <item.icon size={15} style={{ color: "#c4b5fd", flexShrink: 0 }} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-sm"
          style={{ background: "rgba(167,139,250,0.14)", border: "1px solid rgba(167,139,250,0.28)", boxShadow: "0 0 30px rgba(167,139,250,0.1)" }}>
          Start Earning Today <ArrowRight size={16} />
        </Link>
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          Already have an account?{" "}
          <Link href="/dashboard" style={{ color: "#c4b5fd" }}>Go to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
