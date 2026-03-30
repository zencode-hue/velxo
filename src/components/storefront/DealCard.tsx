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
}

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-red-400 bg-red-500/10 border-red-500/20",
  AI_TOOLS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SOFTWARE: "text-green-400 bg-green-500/10 border-green-500/20",
  GAMING: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function DealCard({
  id, title, category, imageUrl, originalPrice, dealPrice,
  discountPct, savings, inStock,
}: DealCardProps) {
  const catColor = CATEGORY_COLORS[category] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: "rgba(26,27,35,0.9)", border: "1px solid rgba(46,48,68,0.7)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(234,88,12,0.5)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(234,88,12,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(46,48,68,0.7)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}>

      {/* Discount badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black text-white"
          style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)" }}>
          -{discountPct.toFixed(0)}% OFF
        </span>
      </div>

      {/* Stock badge */}
      {inStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
            <Zap size={9} /> In Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video bg-white/5 overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} className="text-gray-700" />
          </div>
        )}
        {/* Urgency overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${catColor}`}>
          {catLabel}
        </span>

        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3">{title}</h3>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-black text-white">
            <PriceDisplay usdAmount={dealPrice} />
          </span>
          <div className="flex flex-col items-start">
            <PriceDisplay usdAmount={originalPrice} strikethrough className="text-sm" />
            <span className="text-xs text-green-400 font-medium">
              Save <PriceDisplay usdAmount={savings} />
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/checkout/confirm?productId=${id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)", boxShadow: "0 4px 15px rgba(234,88,12,0.3)" }}>
          <ShoppingCart size={14} /> Grab Deal
        </Link>
      </div>
    </div>
  );
}
