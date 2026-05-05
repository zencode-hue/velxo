import type { Metadata } from "next";
import { Tag, Clock, Zap, Lock } from "lucide-react";
import DealCard from "@/components/storefront/DealCard";
import DealCountdown from "@/components/storefront/DealCountdown";
import { getDealsData, type DealItem } from "@/lib/server-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Hot Deals — MetraMart",
  description: "Daily deals with 20% off — refreshes every 24 hours. Limited time only.",
};

// DealItem type imported from server-data

export default async function DealsPage() {
  const { deals, resetAt } = await getDealsData();

  return (
    <div className="min-h-screen" style={{ background: "#080c0a" }}>
      {/* Neon green hero */}
      <div className="relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.015) 2px, rgba(0,255,136,0.015) 4px)",
        }} />
        {/* Glow */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,136,0.12) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 40% at 0% 100%, rgba(0,255,136,0.06) 0%, transparent 50%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 font-mono"
              style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.4)", color: "#00ff88" }}>
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              VAULT OPEN — 24H ONLY
            </div>

            <h1 className="text-5xl sm:text-6xl font-black mb-4 font-mono tracking-tight">
              <span style={{ color: "#00ff88", textShadow: "0 0 40px rgba(0,255,136,0.5), 0 0 80px rgba(0,255,136,0.2)" }}>
                DEAL
              </span>
              <span className="text-white"> VAULT</span>
            </h1>

            <p className="text-lg mb-2 max-w-xl mx-auto" style={{ color: "rgba(0,255,136,0.7)" }}>
              {deals.length} products unlocked at{" "}
              <span className="font-black text-[#00ff88]">20% OFF</span>
            </p>
            <p className="text-sm text-gray-600 mb-8">Vault resets every 24 hours. Access expires at midnight.</p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl font-mono"
              style={{ background: "rgba(0,10,5,0.9)", border: "1px solid rgba(0,255,136,0.3)", boxShadow: "0 0 20px rgba(0,255,136,0.08)" }}>
              <DealCountdown resetAt={resetAt} neon />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-y py-2.5" style={{ borderColor: "rgba(0,255,136,0.15)", background: "rgba(0,255,136,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-xs flex-wrap font-mono">
          <span className="flex items-center gap-1.5" style={{ color: "rgba(0,255,136,0.8)" }}>
            <Zap size={12} /> INSTANT DELIVERY
          </span>
          <span style={{ color: "rgba(0,255,136,0.2)" }}>///</span>
          <span className="flex items-center gap-1.5" style={{ color: "rgba(0,255,136,0.8)" }}>
            <Lock size={12} /> ENCRYPTED CREDENTIALS
          </span>
          <span style={{ color: "rgba(0,255,136,0.2)" }}>///</span>
          <span className="flex items-center gap-1.5" style={{ color: "rgba(0,255,136,0.8)" }}>
            <Clock size={12} /> RESETS AT MIDNIGHT UTC
          </span>
          <span style={{ color: "rgba(0,255,136,0.2)" }}>///</span>
          <span className="flex items-center gap-1.5" style={{ color: "rgba(0,255,136,0.8)" }}>
            <Tag size={12} /> {deals.length} DEALS ACTIVE
          </span>
        </div>
      </div>

      {/* Deals grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deals.length === 0 ? (
          <div className="text-center py-20" style={{ color: "rgba(0,255,136,0.4)" }}>
            <Lock size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-mono font-medium">VAULT EMPTY</p>
            <p className="text-sm mt-1 font-mono">New deals unlock daily at midnight UTC.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {deals.map((deal) => (
                <DealCard key={deal.id} {...deal} neon />
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-mono text-sm"
                style={{ background: "rgba(0,10,5,0.9)", border: "1px solid rgba(0,255,136,0.2)", color: "rgba(0,255,136,0.7)" }}>
                <Clock size={16} style={{ color: "#00ff88" }} />
                Vault closes at midnight UTC. Prices revert to normal after reset.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
