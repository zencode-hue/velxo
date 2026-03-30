import type { Metadata } from "next";
import { Flame, Zap, AlertTriangle } from "lucide-react";
import DealCard from "@/components/storefront/DealCard";
import DealCountdown from "@/components/storefront/DealCountdown";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Hot Deals — Velxo Shop",
  description: "Daily deals with 20% off — refreshes every 24 hours. Limited time only.",
};

interface Deal {
  id: string; title: string; category: string; imageUrl: string | null;
  originalPrice: number; dealPrice: number; discountPct: number;
  savings: number; inStock: boolean; avgRating: number;
}

async function getDeals(): Promise<{ deals: Deal[]; resetAt: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${appUrl}/api/v1/deals`, { cache: "no-store" });
    const data = await res.json();
    return data.data ?? { deals: [], resetAt: new Date().toISOString() };
  } catch {
    return { deals: [], resetAt: new Date().toISOString() };
  }
}

export default async function DealsPage() {
  const { deals, resetAt } = await getDeals();

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(220,38,38,0.1) 50%, rgba(14,15,20,0) 100%)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.4)", color: "#fb923c" }}>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              LIVE DEALS — Refreshes Daily
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 flex items-center justify-center gap-3">
              <Flame size={52} className="text-orange-400" />
              Hot Deals
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              {deals.length} products at <span className="text-orange-400 font-bold">20% off</span> today only.
              New deals drop every 24 hours.
            </p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl"
              style={{ background: "rgba(26,27,35,0.9)", border: "1px solid rgba(234,88,12,0.3)" }}>
              <DealCountdown resetAt={resetAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Urgency bar */}
      <div className="border-y border-orange-500/20 py-3" style={{ background: "rgba(234,88,12,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-sm flex-wrap">
          <span className="flex items-center gap-1.5 text-orange-300">
            <Zap size={14} /> Instant delivery after payment
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1.5 text-orange-300">
            <AlertTriangle size={14} /> Limited time — prices reset at midnight
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1.5 text-orange-300">
            <Flame size={14} /> {deals.length} deals available today
          </span>
        </div>
      </div>

      {/* Deals grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {deals.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Flame size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No deals right now</p>
            <p className="text-sm mt-1">Check back soon — new deals drop daily.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {deals.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>

            {/* Bottom urgency */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
                style={{ background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)" }}>
                <AlertTriangle size={18} className="text-orange-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  These deals expire at <span className="text-orange-400 font-bold">midnight UTC</span>.
                  After that, prices return to normal.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
