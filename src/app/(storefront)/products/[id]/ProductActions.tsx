"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Heart, Check, CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Variant {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  unlimitedStock: boolean;
  inStock: boolean;
}

interface Props {
  productId: string;
  productTitle: string;
  price: number;
  inStock: boolean;
  imageUrl?: string | null;
  category?: string;
  variants?: Variant[];
  // features passed from server for reactive display
  features?: string[];
}

export default function ProductActions({
  productId, productTitle, price, inStock, imageUrl, category, variants = [], features = [],
}: Props) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const hasVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? (variants.find((v) => v.inStock) ?? variants[0]) : null
  );
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false;
    return (JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[]).includes(productId);
  });
  const [addedToCart, setAddedToCart] = useState(false);

  const effectivePrice = selectedVariant ? selectedVariant.price : price;
  const effectiveInStock = selectedVariant ? selectedVariant.inStock : inStock;
  const cartKey = selectedVariant ? `${productId}__${selectedVariant.id}` : productId;
  const inCart = items.some((i) => i.id === cartKey);

  // Price range for display when no variant selected yet (or no variants)
  const priceRange = hasVariants
    ? { min: Math.min(...variants.map((v) => v.price)), max: Math.max(...variants.map((v) => v.price)) }
    : null;

  function toggleWishlist() {
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    const next = wishlisted ? list.filter((id) => id !== productId) : [...list, productId];
    localStorage.setItem("velxo_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  }

  function handleAddToCart() {
    if (!effectiveInStock) return;
    const label = selectedVariant ? `${productTitle} — ${selectedVariant.name}` : productTitle;
    addItem({ id: cartKey, title: label, price: effectivePrice, category: category ?? "", imageUrl, variantId: selectedVariant?.id, productId });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    if (!effectiveInStock) return;
    router.push(selectedVariant
      ? `/checkout?productId=${productId}&variantId=${selectedVariant.id}`
      : `/checkout?productId=${productId}`
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Live price display */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-white">
          ${effectivePrice.toFixed(2)}
        </span>
        {hasVariants && !selectedVariant && priceRange && priceRange.min !== priceRange.max && (
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            from ${priceRange.min.toFixed(2)}
          </span>
        )}
        {selectedVariant && (
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {selectedVariant.name}
          </span>
        )}
      </div>

      {/* Live stock status */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          effectiveInStock
            ? "text-green-400 bg-green-500/10 border-green-500/30"
            : "text-red-400 bg-red-500/10 border-red-500/30"
        }`}>
          {effectiveInStock && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
          {effectiveInStock ? "Available" : "Out of Stock"}
        </span>
        {effectiveInStock && selectedVariant && !selectedVariant.unlimitedStock && selectedVariant.stockCount > 0 && (
          <span className="text-xs text-gray-500">{selectedVariant.stockCount} left</span>
        )}
      </div>

      {/* Variant selector — vertical */}
      {hasVariants && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Choose a plan:</p>
          <div className="flex flex-col gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => v.inStock && setSelectedVariant(v)}
                  disabled={!v.inStock}
                  className="relative flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left w-full"
                  style={{
                    background: isSelected ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                    border: isSelected ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    cursor: !v.inStock ? "not-allowed" : "pointer",
                    opacity: !v.inStock ? 0.45 : 1,
                    boxShadow: isSelected ? "0 0 16px rgba(167,139,250,0.15)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isSelected ? "#a78bfa" : "rgba(255,255,255,0.2)",
                        background: isSelected ? "#a78bfa" : "transparent",
                      }}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: isSelected ? "#e9d5ff" : "rgba(255,255,255,0.8)" }}>
                        {v.name}
                      </span>
                      {!v.inStock && (
                        <span className="ml-2 text-xs text-red-400">· sold out</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-base shrink-0" style={{ color: isSelected ? "#c4b5fd" : "rgba(255,255,255,0.6)" }}>
                    ${v.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Features list — reactive (shows after variant selection if variants exist) */}
      {features.length > 0 && (
        <div className="space-y-1.5">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm text-gray-400">
              <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {effectiveInStock ? (
        <div className="flex gap-3">
          <button onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: inCart || addedToCart ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
              border: inCart || addedToCart ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.12)",
            }}>
            {inCart || addedToCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
          </button>
          <button onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", boxShadow: "0 4px 20px rgba(167,139,250,0.2)" }}>
            <Zap size={16} /> Buy Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button disabled className="w-full py-4 rounded-xl font-bold text-gray-500 cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            Out of Stock
          </button>
          <NotifyMeForm productId={productId} />
        </div>
      )}

      {/* Wishlist */}
      <button onClick={toggleWishlist}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
          wishlisted
            ? "text-red-400 bg-red-500/10 border border-red-500/20"
            : "text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/20 hover:bg-red-500/5"
        }`}>
        <Heart size={14} className={wishlisted ? "fill-red-400" : ""} />
        {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}

function NotifyMeForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/notify-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch { setStatus("error"); }
  }

  if (status === "done") return <p className="text-xs text-green-400 text-center py-2">We&apos;ll email you when this is back in stock.</p>;

  return (
    <form onSubmit={submit} className="space-y-2">
      <p className="text-xs text-gray-500 text-center">Get notified when back in stock</p>
      <div className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com" required className="input-field flex-1 text-sm py-2" />
        <button type="submit" disabled={status === "loading"} className="btn-secondary text-sm px-4 py-2 shrink-0">
          {status === "loading" ? "…" : "Notify"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-400 text-center">Failed. Try again.</p>}
    </form>
  );
}
