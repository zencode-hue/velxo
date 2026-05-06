"use client";

import { useState } from "react";
import { Search, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean; orderId?: string } | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.data?.found) {
        setError("No order found with that ID and email combination.");
        setResult(null);
      } else {
        setResult({ found: true, orderId: orderId.trim() });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Package size={24} style={{ color: "#fbbf24" }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Enter your order ID and email to check your order status.
          </p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Order ID</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. VLX-ABC123 or full order ID"
                required
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2">
              <Search size={15} />
              {loading ? "Searching…" : "Track Order"}
            </button>
          </form>

          {result?.found && result.orderId && (
            <div className="mt-5 p-4 rounded-xl text-center" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <p className="text-sm text-green-400 font-medium mb-3">Order found!</p>
              <Link href={`/invoice/${result.orderId}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white btn-primary px-5 py-2.5">
                View Invoice <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          Signed in? <Link href="/dashboard/orders" style={{ color: "#fbbf24" }}>View all orders in dashboard</Link>
        </p>
      </div>
    </div>
  );
}
