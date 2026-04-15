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
}

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-red-400 bg-red-500/10 border-red-500/20",
  AI_TOOLS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SOFTWARE: "text-green-400 bg-green-500/10 border-green-500/20",
  GAMING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock, unlimitedStock }: ProductCardProps) {
  const available = unlimitedStock || inStock;
  const catColor = CATEGORY_COLORS[category] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;
  const href = productPath(id, title);

  return (
    <div className="glass-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg" style={{ boxShadow: "0 0 0 0 transparent" }}>
      <Link href={href} className="relative w-full aspect-video overflow-hidden block" style={{ background: "rgba(22,27,39,0.8)" }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2.5 right-2.5">
          {available ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 backdrop-blur-sm">
              <Zap size={9} /> In Stock
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 backdrop-blur-sm">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <span className={`self-start text-xs px-2.5 py-0.5 rounded-full border font-medium ${catColor}`}>
          {catLabel}
        </span>
        <Link href={href} className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug hover:text-blue-300 transition-colors">
          {title}
        </Link>
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              <PriceDisplay usdAmount={price} />
            </span>
            {avgRating !== undefined && avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={11} fill="currentColor" /> {avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <Link href={href}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{
              background: available ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.05)",
              boxShadow: available ? "0 2px 12px rgba(59,130,246,0.25)" : "none",
              opacity: available ? 1 : 0.5,
            }}>
            <ShoppingCart size={14} />
            {available ? "Buy Now" : "Out of Stock"}
          </Link>
        </div>
      </div>
    </div>
  );
}
