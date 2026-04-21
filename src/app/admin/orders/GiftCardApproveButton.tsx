"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export default function GiftCardApproveButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function approve() {
    if (!confirm("Approve this gift card payment and deliver the product?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-xs text-green-400">Approved ✓</span>;

  return (
    <button onClick={approve} disabled={loading}
      className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50 border border-yellow-400/20 rounded-lg px-2 py-1 hover:bg-yellow-400/10">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
      Approve Gift Card
    </button>
  );
}
