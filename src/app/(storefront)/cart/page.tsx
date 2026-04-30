"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <ShoppingBag size={36} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link href="/products" className="btn-primary text-sm px-6 py-2.5">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag size={22} className="text-purple-400" />
          Cart
          <span className="text-sm font-normal text-gray-500">({items.length} item{items.length !== 1 ? "s" : ""})</span>
        </h1>
        <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{CAT[item.category] ?? item.category}</p>
            </div>
            <p className="font-bold text-white shrink-0">${item.price.toFixed(2)}</p>
            <button onClick={() => removeItem(item.id)}
              className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 mb-4">
        <div className="flex justify-between font-bold border-t border-white/5 pt-3">
          <span className="text-white">Total</span>
          <span className="text-white text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/checkout?productId=${item.productId}${item.variantId ? `&variantId=${item.variantId}` : ""}`}
            className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}
          >
            <span className="truncate">{item.title}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-purple-300">${item.price.toFixed(2)}</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        Digital products are purchased individually.
      </p>
    </div>
  );
}
