"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, Package, ShoppingCart } from "lucide-react";
import PriceDisplay from "./PriceDisplay";

interface DealCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  originalPrice: number;
  dealPrice: number;
  discountPct: number;
  savings: number;
  inStock: boolean;
  avgRating?: number;
  neon?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  AI_TOOLS: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  SOFTWARE: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  GAMING: "text-amber-300 bg-amber-400/10 border-amber-400/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function DealCard({
  id, title, category, imageUrl, originalPrice, dealPrice,
  discountPct, savings, inStock,
}: DealCardProps) {
  const catColor = CATEGORY_COLORS[category] ?? "text-amber-400 bg-amber-500/10 border-amber-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div className="deal-card relative group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: "rgba(20,14,0,0.95)" }}>

      {/* Discount badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
          -{discountPct.toFixed(0)}% OFF
        </span>
      </div>

      {/* Stock badge */}
      {inStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Zap size={9} /> In Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden" style={{ background: "rgba(10,7,0,0.8)" }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} style={{ color: "rgba(245,158,11,0.2)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${catColor}`}>
          {catLabel}
        </span>

        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3">{title}</h3>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-black" style={{ color: "#fbbf24" }}>
            <PriceDisplay usdAmount={dealPrice} />
          </span>
          <div className="flex flex-col items-start">
            <PriceDisplay usdAmount={originalPrice} strikethrough className="text-sm" />
            <span className="text-xs font-medium" style={{ color: "rgba(245,158,11,0.7)" }}>
              Save <PriceDisplay usdAmount={savings} />
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/checkout/confirm?productId=${id}&dealPrice=${dealPrice}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", boxShadow: "0 4px 15px rgba(245,158,11,0.3)" }}>
          <ShoppingCart size={14} /> Grab Deal
        </Link>
      </div>
    </div>
  );
}
