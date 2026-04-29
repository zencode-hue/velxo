"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { formatOrderId } from "@/lib/slug";

const DISCORD_URL = "https://discord.gg/2b8AkfW6EP";

export default function SuccessClient({ pendingStock }: { pendingStock?: boolean }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copied, setCopied] = useState(false);

  const displayId = orderId ? formatOrderId(orderId) : null;

  function copyOrderId() {
    if (!displayId) return;
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (pendingStock && orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.06) 0%, transparent 50%)" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(249,115,22,0.15)", border: "2px solid rgba(249,115,22,0.3)" }}>
            <AlertTriangle size={40} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Payment Received!</h1>
          <p className="text-gray-400 mb-2">This product is temporarily out of stock.</p>
          <p className="text-sm text-gray-500 mb-6">Join our Discord and share your Order ID to claim your product manually.</p>

          <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <p className="text-xs text-gray-500 mb-2">Your Order Reference — share this in Discord</p>
            <div className="flex items-center gap-2 justify-between">
              <p className="font-mono text-lg font-bold text-orange-300">{displayId}</p>
              <button onClick={copyOrderId} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: copied ? "rgba(16,185,129,0.2)" : "rgba(249,115,22,0.2)", border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(249,115,22,0.4)"}`, color: copied ? "#34d399" : "#fb923c" }}>
                <Copy size={12} /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold text-white text-sm mb-3"
            style={{ background: "linear-gradient(135deg, #5865f2, #7289da)" }}>
            <ExternalLink size={16} /> Join Discord to Claim
          </a>

          <div className="flex gap-3 justify-center">
            {orderId && (
              <Link href={`/invoice/${orderId}`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm border border-white/10 hover:bg-white/5 transition-all">
                <Package size={14} /> View Order
              </Link>
            )}
            <Link href="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/8 hover:border-white/20 transition-all">
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.06) 0%, transparent 50%)" }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)" }}>
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
        <p className="text-gray-400 mb-2">Your order has been confirmed.</p>
        <p className="text-sm text-gray-500 mb-6">Check your email for delivery details. Credentials are delivered instantly.</p>

        {orderId && (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-gray-500 mb-1">Order Reference</p>
            <p className="font-mono text-sm text-white">VLX-{orderId.slice(-6).toUpperCase()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={`/invoice/${orderId}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
              <Package size={16} /> View Invoice
            </Link>
          )}
          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm border border-white/10 hover:bg-white/5 transition-all">
            My Orders <ArrowRight size={16} />
          </Link>
          <Link href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/8 hover:border-white/20 transition-all">
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}

