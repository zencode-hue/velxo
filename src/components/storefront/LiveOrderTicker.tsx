"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function LiveOrderTicker() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.data?.todayOrders ?? null))
      .catch(() => {});
  }, []);

  if (count === null || count === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs"
      style={{ color: "rgba(255,255,255,0.5)" }}>
      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <span>
        <span className="text-white font-semibold">{count}</span> orders delivered today
      </span>
      <Zap size={11} style={{ color: "#4ade80" }} />
    </div>
  );
}
