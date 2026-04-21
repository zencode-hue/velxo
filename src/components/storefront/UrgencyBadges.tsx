"use client";

import { useEffect, useState } from "react";
import { Eye, Flame } from "lucide-react";

interface Props {
  productId: string;
  stockCount: number;
  unlimitedStock: boolean;
}

export default function UrgencyBadges({ productId, stockCount, unlimitedStock }: Props) {
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    // Simulate viewers based on productId hash for consistency
    const hash = productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = (hash % 12) + 3; // 3–14 viewers
    setViewers(base);

    // Slowly fluctuate
    const interval = setInterval(() => {
      setViewers((v) => {
        if (v === null) return base;
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(20, v + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [productId]);

  const lowStock = !unlimitedStock && stockCount > 0 && stockCount <= 5;

  if (!viewers && !lowStock) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {viewers !== null && (
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
          <Eye size={11} />
          <span><span className="text-white font-medium">{viewers}</span> people viewing</span>
        </div>
      )}
      {lowStock && (
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full animate-pulse"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          <Flame size={11} />
          <span>Only <span className="font-bold">{stockCount}</span> left!</span>
        </div>
      )}
    </div>
  );
}
