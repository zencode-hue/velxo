"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Minus, Plus, Heart } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/lib/currency";

interface Props {
  productId: string;
  productTitle: string;
  price: number;
  inStock: boolean;
}

export default function ProductActions({ productId, price, inStock }: Props) {
  const router = useRouter();
  const { currency, rates } = useCurrency();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false;
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    return list.includes(productId);
  });

  function toggleWishlist() {
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    const next = wishlisted ? list.filter((id) => id !== productId) : [...list, productId];
    localStorage.setItem("velxo_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  }

  function handleBuyNow() {
    router.push(`/checkout/confirm?productId=${productId}&qty=${qty}`);
  }

  function handleAddToCart() {
    const cart = JSON.parse(localStorage.getItem("velxo_cart") ?? "[]") as Array<{ id: string; qty: number }>;
    const existing = cart.find((i) => i.id === productId);
    if (existing) { existing.qty += qty; } else { cart.push({ id: productId, qty }); }
    localStorage.setItem("velxo_cart", JSON.stringify(cart));
    router.push(`/checkout/confirm?productId=${productId}&qty=${qty}`);
  }

  if (!inStock) {
    return (
      <div className="space-y-3">
        <button disabled className="w-full py-4 rounded-xl font-bold text-gray-500 bg-gray-800 cursor-not-allowed">
          Out of Stock
        </button>
        <p className="text-xs text-gray-600 text-center">This product is currently unavailable</p>
      </div>
    );
  }

  const totalFormatted = formatPrice(price * qty, currency, rates);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-gray-400 font-medium">Quantity:</span>
        <div className="flex items-center gap-2 rounded-xl p-1" style={{ background: "rgba(26,18,8,0.8)", border: "1px solid rgba(61,42,16,0.8)" }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-white font-semibold text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Plus size={14} />
          </button>
        </div>
        <span className="text-sm text-gray-500">Total: <span className="text-white font-bold">{totalFormatted}</span></span>
      </div>
      <div className="flex gap-3">
        <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5" style={{ background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.4)" }}>
          <ShoppingCart size={16} /> Add to Cart
        </button>
        <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 4px 20px rgba(234,88,12,0.35)" }}>
          <Zap size={16} /> Buy Now
        </button>
      </div>
      <button onClick={toggleWishlist} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${wishlisted ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/20 hover:bg-red-500/5"}`}>
        <Heart size={14} className={wishlisted ? "fill-red-400" : ""} />
        {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}