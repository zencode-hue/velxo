"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Trash2, Package, ArrowRight, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default function CartDrawer({ open, onClose }: Props) {
  const { items, total, removeItem, clearCart } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col w-full max-w-sm transition-transform duration-300 ease-out"
        style={{
          background: "rgba(10,10,10,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(40px)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} className="text-purple-400" />
            <span className="font-bold text-white">Cart</span>
            {items.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(167,139,250,0.15)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.25)" }}>
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1">
                Clear all
              </button>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <ShoppingCart size={28} className="text-purple-400/50" />
              </div>
              <p className="text-white font-medium mb-1">Your cart is empty</p>
              <p className="text-gray-600 text-sm mb-5">Add products to get started</p>
              <Link href="/products" onClick={onClose}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
                Browse products <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package size={18} className="text-purple-400/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.category] ?? item.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-white">${item.price.toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)}
                    className="p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4 shrink-0 space-y-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-white font-bold text-lg">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Digital products are purchased individually
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/checkout?productId=${item.productId}${item.variantId ? `&variantId=${item.variantId}` : ""}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <span className="truncate text-xs">{item.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Zap size={11} className="text-purple-400" />
                    <span className="text-purple-300 text-xs">${item.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/cart" onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
