import Link from "next/link";
import Image from "next/image";
import { Star, Zap, Package } from "lucide-react";

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
  STREAMING: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  AI_TOOLS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SOFTWARE: "text-green-400 bg-green-500/10 border-green-500/20",
  GAMING: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock, unlimitedStock }: ProductCardProps) {
  const available = unlimitedStock || inStock;
  const catColor = CATEGORY_COLORS[category] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";
  const catLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <Link href={`/products/${id}`} className="glass-card group flex flex-col overflow-hidden hover:border-purple-500/30 transition-all duration-200">
      <div className="relative w-full aspect-video bg-white/5 overflow-hidden">
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
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-xs px-2 py-0.5 rounded-full border font-medium ${catColor}`}>
          {catLabel}
        </span>
        <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{title}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-white">${price.toFixed(2)}</span>
          {avgRating !== undefined && avgRating > 0 && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={12} fill="currentColor" /> {avgRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
