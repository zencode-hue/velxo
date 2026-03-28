"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

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
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-600"
          }
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({
  id,
  title,
  price,
  category,
  imageUrl,
  avgRating,
  stockCount,
  inStock,
  unlimitedStock,
}: ProductCardProps) {
  const available = unlimitedStock || inStock;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card-hover flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full aspect-video bg-surface-2 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart size={32} className="text-gray-700" />
          </div>
        )}
        {/* Stock badge overlay */}
        <div className="absolute top-2 right-2">
          {available ? (
            <span className="badge-green">In Stock</span>
          ) : (
            <span className="badge-red">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">
            {title}
          </h3>
          <span className="badge-purple shrink-0">
            {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>

        <StarRating rating={avgRating} />

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <span className="text-lg font-bold text-white">
            ${price.toFixed(2)}
          </span>
          <Link
            href={available ? `/checkout?productId=${id}` : "#"}
            onClick={(e) => !available && e.preventDefault()}
            className={`btn-primary text-xs px-4 py-2 ${!available ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            aria-disabled={!available}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
