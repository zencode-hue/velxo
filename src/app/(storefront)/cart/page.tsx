"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
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
        <Link href="/products" className="btn-primary text-sm px-6 py-2.5">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag size={22} className="text-purple-400" /> Cart
          <span className="text-sm font-normal text-gray-500">({items.length} item{items.length !== 1 ? "s" : ""})</span>
        </h1>
        <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package size={20} className="text-purple-400/40" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.category] ?? item.category}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-white">${item.price.toFixed(2)}</p>
            </div>
            <button onClick={() => removeItem(item.id)}
              className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-5 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
          <span className="text-white font-medium">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-white/5 pt-3 mt-3">
          <span className="text-white">Total</span>
          <span className="text-white text-lg">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout each item individually (digital products) */}
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.id} href={`/checkout?productId=${item.id}`}
            className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)" }}>
            <span className="truncate">{item.title}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-purple-300">${item.price.toFixed(2)}</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        Digital products are purchased individually. Each item goes through its own checkout.
      </p>
    </div>
  );
}
