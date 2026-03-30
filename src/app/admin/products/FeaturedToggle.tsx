"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FeaturedToggle({ productId, isFeatured }: { productId: string; isFeatured: boolean }) {
  const [featured, setFeatured] = useState(isFeatured);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !featured }),
    });
    setFeatured(!featured);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading} title={featured ? "Unfeature" : "Feature"}
      className={`p-1 transition-colors ${featured ? "text-yellow-400 hover:text-yellow-300" : "text-gray-600 hover:text-yellow-400"}`}>
      <Star size={13} fill={featured ? "currentColor" : "none"} />
    </button>
  );
}
