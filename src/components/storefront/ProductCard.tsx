import Link from "next/link";
import Image from "next/image";
import { Star, Zap, Package, ShoppingCart } from "lucide-react";
import PriceDisplay from "./PriceDisplay";
import { productPath } from "@/lib/slug";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  avgRating?: number;
  inStock?: boolean;
  unlimitedStock?: boolean;
  stockCount?: number;
  variants?: Array<{ price: number; inStock: boolean }>;
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

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock, unlimitedStock }: ProductCardProps) {
  const available = unlimitedStock || inStock;
  const catColor = CATEGORY_COLORS[category] ?? "text-amber-400 bg-amber-500/10 border-amber-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;
  const href = productPath(id, title);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,158,11,0.25)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(245,158,11,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}>
      <Link href={href} className="relative w-full aspect-video overflow-hidden block" style={{ background: "rgba(15,12,0,0.8)" }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} style={{ color: "rgba(245,158,11,0.2)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2.5 right-2.5">
          {available ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
              <Zap size={9} /> In Stock
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <span className={`self-start text-xs px-2.5 py-0.5 rounded-full border font-medium ${catColor}`}>
          {catLabel}
        </span>
        <Link href={href} className="text-sm font-semibold text-white line-clamp-2 leading-snug hover:text-amber-300 transition-colors">
          {title}
        </Link>
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              <PriceDisplay usdAmount={price} />
            </span>
            {avgRating !== undefined && avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "#fbbf24" }}>
                <Star size={11} fill="currentColor" /> {avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <Link href={href}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: available ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.05)",
              color: available ? "#000" : "rgba(255,255,255,0.3)",
              boxShadow: available ? "0 2px 12px rgba(245,158,11,0.3)" : "none",
            }}>
            <ShoppingCart size={14} />
            {available ? "Buy Now" : "Out of Stock"}
          </Link>
        </div>
      </div>
    </div>
  );
}
