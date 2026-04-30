"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, Zap, Bitcoin, MessageCircle, Wallet, CreditCard, Loader2, CheckCircle, ArrowRight, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

type Provider = "nowpayments" | "discord" | "balance" | "binance_gift_card";

interface OrderResult {
  productId: string;
  title: string;
  price: number;
  orderId?: string;
  invoiceUrl?: string;
  redirectUrl?: string;
  error?: string;
  status: "pending" | "done" | "error";
}

const PAYMENT_METHODS: { id: Provider; label: string; sub: string; icon: typeof Bitcoin; color: string }[] = [
  { id: "balance", label: "Wallet Balance", sub: "Instant — uses your store credit", icon: Wallet, color: "#22d3ee" },
  { id: "binance_gift_card", label: "Card Payment (Key)", sub: "Binance USDT Gift Card via Eneba", icon: CreditCard, color: "#f0b90b" },
  { id: "nowpayments", label: "Crypto", sub: "BTC, ETH, USDT, 100+ coins", icon: Bitcoin, color: "#fb923c" },
  { id: "discord", label: "Discord Manual", sub: "Pay manually via Discord", icon: MessageCircle, color: "#818cf8" },
];

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "payment" | "processing" | "done">("cart");
  const [selectedPayment, setSelectedPayment] = useState<Provider | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [results, setResults] = useState<OrderResult[]>([]);
  const [isNorthAmerica, setIsNorthAmerica] = useState(false);

  useEffect(() => {
    // Fetch balance and geo
    Promise.all([
      fetch("/api/v1/balance").then((r) => r.json()).catch(() => null),
      fetch("https://ipapi.co/json/").then((r) => r.json()).catch(() => null),
    ]).then(([balData, geoData]) => {
      if (balData?.data?.balance !== undefined) setBalance(Number(balData.data.balance));
      if (["US", "CA", "MX"].includes(geoData?.country_code)) setIsNorthAmerica(true);
    });
  }, []);

  async function handleCheckoutAll() {
    if (!selectedPayment || items.length === 0) return;
    setStep("processing");

    const orderResults: OrderResult[] = items.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      status: "pending",
    }));
    setResults([...orderResults]);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const res = await fetch("/api/v1/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            paymentProvider: selectedPayment,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          orderResults[i] = { ...orderResults[i], status: "error", error: data.error ?? "Failed" };
        } else {
          const orderId = data.data?.orderId;
          const redirectUrl = data.data?.redirectUrl;
          orderResults[i] = {
            ...orderResults[i],
            status: "done",
            orderId,
            invoiceUrl: orderId ? `/invoice/${orderId}` : undefined,
            redirectUrl,
          };
        }
      } catch {
        orderResults[i] = { ...orderResults[i], status: "error", error: "Network error" };
      }
      setResults([...orderResults]);
      // Small delay between orders
      if (i < items.length - 1) await new Promise((r) => setTimeout(r, 300));
    }

    setStep("done");

    // For single-redirect providers (crypto, discord), redirect to first successful order
    if (selectedPayment === "nowpayments" || selectedPayment === "discord") {
      const first = orderResults.find((r) => r.redirectUrl);
      if (first?.redirectUrl) {
        // Clear cart and redirect
        clearCart();
        window.location.href = first.redirectUrl;
        return;
      }
    }

    // For balance/gift card — clear cart, show results
    if (selectedPayment === "balance") {
      clearCart();
    }
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <ShoppingBag size={36} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link href="/products" className="btn-primary text-sm px-6 py-2.5">Browse Products</Link>
      </div>
    );
  }

  // ── Processing ──────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Processing Orders</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Creating your orders one by one...</p>
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: r.status === "done" ? "rgba(52,211,153,0.15)" : r.status === "error" ? "rgba(248,113,113,0.15)" : "rgba(167,139,250,0.1)",
                }}>
                {r.status === "done" ? <CheckCircle size={16} className="text-green-400" /> :
                 r.status === "error" ? <X size={16} className="text-red-400" /> :
                 <Loader2 size={16} className="text-purple-400 animate-spin" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                <p className="text-xs text-gray-500">${r.price.toFixed(2)}</p>
              </div>
              <span className="text-xs shrink-0" style={{
                color: r.status === "done" ? "#4ade80" : r.status === "error" ? "#f87171" : "rgba(255,255,255,0.3)"
              }}>
                {r.status === "done" ? "Done" : r.status === "error" ? r.error : "Processing..."}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (step === "done") {
    const successful = results.filter((r) => r.status === "done");
    const failed = results.filter((r) => r.status === "error");
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(52,211,153,0.15)", border: "2px solid rgba(52,211,153,0.3)" }}>
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {failed.length === 0 ? "All Orders Created!" : `${successful.length} of ${results.length} Orders Created`}
          </h1>
          <p className="text-gray-500 text-sm">
            {selectedPayment === "balance" ? "Your products are being delivered to your email." : "Complete payment for each order below."}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {results.map((r, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                  <p className="text-xs text-gray-500">${r.price.toFixed(2)}</p>
                </div>
                {r.status === "done" && r.invoiceUrl ? (
                  <Link href={r.invoiceUrl}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors shrink-0">
                    View Invoice <ArrowRight size={12} />
                  </Link>
                ) : r.status === "error" ? (
                  <span className="text-xs text-red-400 shrink-0">{r.error}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
            My Orders
          </Link>
          <Link href="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 transition-all">
            Shop More
          </Link>
        </div>
      </div>
    );
  }

  // ── Payment selection ───────────────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => setStep("cart")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
          ← Back to cart
        </button>
        <h1 className="text-2xl font-bold text-white mb-2">Choose Payment</h1>
        <p className="text-gray-500 text-sm mb-6">
          One payment method for all {items.length} item{items.length !== 1 ? "s" : ""} — total ${total.toFixed(2)}
        </p>

        <div className="space-y-2 mb-6">
          {PAYMENT_METHODS.filter((m) => {
            if (m.id === "binance_gift_card" && isNorthAmerica) return false;
            if (m.id === "balance" && balance === null) return false;
            return true;
          }).map((m) => {
            const isBalance = m.id === "balance";
            const canUse = !isBalance || (balance !== null && balance >= total);
            const selected = selectedPayment === m.id;
            return (
              <button key={m.id} onClick={() => canUse && setSelectedPayment(m.id)}
                disabled={!canUse}
                className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
                style={{
                  background: selected ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
                  border: selected ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  opacity: canUse ? 1 : 0.4,
                  cursor: canUse ? "pointer" : "not-allowed",
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${m.color}18` }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{m.label}</p>
                  <p className="text-xs text-gray-500">
                    {isBalance ? `Balance: $${(balance ?? 0).toFixed(2)}${!canUse ? " (insufficient)" : ""}` : m.sub}
                  </p>
                </div>
                {selected && <CheckCircle size={16} className="text-purple-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {selectedPayment === "nowpayments" && items.length > 1 && (
          <div className="p-3 rounded-xl mb-4 text-xs"
            style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", color: "#fb923c" }}>
            With crypto, you&apos;ll be redirected to pay for the first item. The remaining items will be saved as pending orders in your dashboard.
          </div>
        )}

        {selectedPayment === "binance_gift_card" && items.length > 1 && (
          <div className="p-3 rounded-xl mb-4 text-xs"
            style={{ background: "rgba(240,185,11,0.08)", border: "1px solid rgba(240,185,11,0.2)", color: "#f0b90b" }}>
            Each item will get its own invoice. You&apos;ll submit a gift card code for each one.
          </div>
        )}

        <button
          onClick={handleCheckoutAll}
          disabled={!selectedPayment}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all"
          style={{ background: selectedPayment ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.35)" }}>
          <Zap size={16} />
          {selectedPayment ? `Pay ${items.length} Item${items.length !== 1 ? "s" : ""} — $${total.toFixed(2)}` : "Select a payment method"}
        </button>
      </div>
    );
  }

  // ── Cart view ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag size={22} className="text-purple-400" />
          Cart
          <span className="text-sm font-normal text-gray-500">({items.length} item{items.length !== 1 ? "s" : ""})</span>
        </h1>
        <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
          Clear all
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{CAT[item.category] ?? item.category}</p>
            </div>
            <p className="font-bold text-white shrink-0">${item.price.toFixed(2)}</p>
            <button onClick={() => removeItem(item.id)}
              className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-5 mb-5">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-white/5 pt-3">
          <span className="text-white">Total</span>
          <span className="text-white text-xl">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Single checkout button */}
      <button
        onClick={() => setStep("payment")}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-base transition-all hover:-translate-y-0.5"
        style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", boxShadow: "0 4px 24px rgba(167,139,250,0.2)" }}>
        <Zap size={18} />
        Checkout All — ${total.toFixed(2)}
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        One payment method for all items. Each product gets its own invoice.
      </p>
    </div>
  );
}
