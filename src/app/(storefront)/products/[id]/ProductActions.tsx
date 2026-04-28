"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Heart, Check } from "lucide-react";
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
}

export default function ProductActions({ productId, productTitle, price, inStock, imageUrl, category, variants = [] }: Props) {
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

  function toggleWishlist() {
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    const next = wishlisted ? list.filter((id) => id !== productId) : [...list, productId];
    localStorage.setItem("velxo_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  }

  function handleAddToCart() {
    const label = selectedVariant ? `${productTitle} — ${selectedVariant.name}` : productTitle;
    addItem({
      id: cartKey,
      title: label,
      price: effectivePrice,
      category: category ?? "",
      imageUrl,
      variantId: selectedVariant?.id,
      productId,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    const url = selectedVariant
      ? `/checkout?productId=${productId}&variantId=${selectedVariant.id}`
      : `/checkout?productId=${productId}`;
    router.push(url);
  }

  if (!effectiveInStock) {
    return (
      <div className="space-y-3">
        {hasVariants && <VariantSelector variants={variants} selected={selectedVariant} onSelect={setSelectedVariant} />}
        <button disabled className="w-full py-4 rounded-xl font-bold text-gray-500 cursor-not-allowed"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          Out of Stock
        </button>
        <NotifyMeForm productId={productId} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasVariants && <VariantSelector variants={variants} selected={selectedVariant} onSelect={setSelectedVariant} />}

      <div className="flex gap-3">
        <button onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: inCart || addedToCart ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
            border: inCart || addedToCart ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.12)",
          }}>
          {inCart || addedToCart ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
        </button>
        <button onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", boxShadow: "0 4px 20px rgba(167,139,250,0.2)" }}>
          <Zap size={16} /> Buy Now
        </button>
      </div>

      <button onClick={toggleWishlist}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${wishlisted ? "text-red-400 bg-red-500/10 border border-red-500/20" : "text-gray-500 hover:text-red-400 border border-white/10 hover:border-red-500/20 hover:bg-red-500/5"}`}>
        <Heart size={14} className={wishlisted ? "fill-red-400" : ""} />
        {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}

function VariantSelector({ variants, selected, onSelect }: { variants: Variant[]; selected: Variant | null; onSelect: (v: Variant) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">Choose option:</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selected?.id === v.id;
          return (
            <button key={v.id} type="button"
              onClick={() => v.inStock && onSelect(v)}
              disabled={!v.inStock}
              className="relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isSelected ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                border: isSelected ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.1)",
                color: !v.inStock ? "rgba(255,255,255,0.25)" : isSelected ? "#c4b5fd" : "rgba(255,255,255,0.7)",
                cursor: !v.inStock ? "not-allowed" : "pointer",
                boxShadow: isSelected ? "0 0 12px rgba(167,139,250,0.2)" : "none",
              }}>
              <span>{v.name}</span>
              <span className="ml-2 font-bold" style={{ color: isSelected ? "#c4b5fd" : "rgba(255,255,255,0.5)" }}>
                ${v.price.toFixed(2)}
              </span>
              {!v.inStock && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] px-1 rounded-full bg-red-500/80 text-white">sold out</span>
              )}
            </button>
          );
        })}
      </div>
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
