import Link from "next/link";
import Image from "next/image";
import { Star, Zap, Package, ShoppingCart } from "lucide-react";
import PriceDisplay from "./PriceDisplay";

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
  GAMING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock, unlimitedStock }: ProductCardProps) {
  const available = unlimitedStock || inStock;
  const catColor = CATEGORY_COLORS[category] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div className="glass-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40">
      <Link href={`/products/${id}`} className="relative w-full aspect-video bg-white/5 overflow-hidden block">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {available ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
              <Zap size={10} /> In Stock
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
              Out of Stock
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-xs px-2 py-0.5 rounded-full border font-medium ${catColor}`}>
          {catLabel}
        </span>
        <Link href={`/products/${id}`} className="text-sm font-semibold text-white line-clamp-2 leading-snug hover:text-orange-300 transition-colors">
          {title}
        </Link>
        <div className="mt-auto pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">
              <PriceDisplay usdAmount={price} />
            </span>
            {avgRating !== undefined && avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={12} fill="currentColor" /> {avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <Link href={`/products/${id}`} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: available ? "linear-gradient(135deg, #ea580c, #f97316)" : "rgba(255,255,255,0.05)", boxShadow: available ? "0 2px 12px rgba(234,88,12,0.3)" : "none", opacity: available ? 1 : 0.5 }}>
            <ShoppingCart size={14} />
            {available ? "Buy Now" : "Out of Stock"}
          </Link>
        </div>
      </div>
    </div>
  );
}