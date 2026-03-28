"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Zap, Package } from "lucide-react";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
  avgRating: number;
  stockCount: number;
  inStock: boolean;
  unlimitedStock?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: "text-red-400 bg-red-500/10 border-red-500/20",
  AI_TOOLS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  SOFTWARE: "text-green-400 bg-green-500/10 border-green-500/20",
  GAMING: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function ProductCard({ id, title, price, category, imageUrl, avgRating, inStock, unlimitedStock }: ProductCardProps) {
  const available = unlimitedStock || inStock;
  const catColor = CATEGORY_COLORS[category] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col overflow-hidden group rounded-xl border border-white/8 bg-[#111111] hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-600/10 transition-all duration-300"
    >
      <Link href={`/products/${id}`} className="block">
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>
              <Package size={36} className="text-purple-400/50" />
              <span className="text-xs text-gray-600">{CATEGORY_LABELS[category] ?? category}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2.5 left-2.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${available ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
              {available && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              {available ? "In Stock" : "Sold Out"}
            </span>
          </div>
          <div className="absolute top-2.5 right-2.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
              {CATEGORY_LABELS[category] ?? category}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">{title}</h3>
        </Link>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={11} className={s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
          ))}
          <span className="text-xs text-gray-600 ml-1.5">{avgRating.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div>
            <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
            <span className="text-xs text-gray-600 ml-1">USD</span>
          </div>
          <Link
            href={available ? `/checkout/confirm?productId=${id}` : "#"}
            onClick={(e) => { if (!available) e.preventDefault(); }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${available ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/25" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
          >
            <Zap size={12} />
            {available ? "Buy Now" : "Sold Out"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
