"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Heart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Props {
  productId: string;
  productTitle: string;
  price: number;
  inStock: boolean;
  imageUrl?: string | null;
  category?: string;
}

export default function ProductActions({ productId, productTitle, price, inStock, imageUrl, category }: Props) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false;
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    return list.includes(productId);
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const inCart = items.some((i) => i.id === productId);

  function toggleWishlist() {
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    const next = wishlisted ? list.filter((id) => id !== productId) : [...list, productId];
    localStorage.setItem("velxo_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  }

  function handleAddToCart() {
    addItem({ id: productId, title: productTitle, price, category: category ?? "", imageUrl });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    router.push(`/checkout?productId=${productId}`);
  }

  if (!inStock) {
    return (
      <div className="space-y-3">
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
