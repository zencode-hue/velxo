"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function RedeliverButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRedeliver() {
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${orderId}/redeliver`, { method: "POST" });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-xs text-green-400">Sent</span>;

  return (
    <button
      onClick={handleRedeliver}
      disabled={loading}
      className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
    >
      <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
      {loading ? "Sending…" : "Re-deliver"}
    </button>
  );
}
