"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    setSaved(list.includes(productId));
  }, [productId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    const next = saved ? list.filter((id) => id !== productId) : [...list, productId];
    localStorage.setItem("velxo_wishlist", JSON.stringify(next));
    setSaved(!saved);
  }

  return (
    <button onClick={toggle} title={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-1.5 rounded-lg transition-all duration-200 ${saved ? "text-red-400 bg-red-500/15" : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"}`}>
      <Heart size={14} className={saved ? "fill-red-400" : ""} />
    </button>
  );
}
