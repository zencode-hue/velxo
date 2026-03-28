"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white"
      style={{ background: "linear-gradient(90deg, #7c3aed, #8b5cf6, #7c3aed)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}>
      <Zap size={14} className="text-yellow-300 shrink-0" />
      <span>🎉 New products added daily — </span>
      <Link href="/products" className="underline underline-offset-2 hover:text-purple-200 transition-colors">
        Browse now
      </Link>
      <span className="hidden sm:inline"> · Instant delivery on all orders</span>
      <button onClick={() => setVisible(false)} className="absolute right-3 text-white/60 hover:text-white transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
