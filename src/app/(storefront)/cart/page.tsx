"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, Zap, Bitcoin, Wallet, Loader2, CheckCircle, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

type Provider = "nowpayments" | "balance";

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<Provider>("nowpayments");
  const [balance, setBalance] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ discountAmount: number; value: number; type: string } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/balance").then((r) => r.json()).then((d) => {
      if (d?.data?.balance !== undefined) setBalance(Number(d.data.balance));
    }).catch(() => {});
  }, []);

  const discount = discountInfo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discount);
  const canPayWithBalance = balance !== null && balance >= finalTotal;

  async function applyDiscount() {
    if (!discountCode.trim() || items.length === 0) return;
    setCheckingDiscount(true); setDiscountErr(null);
    const res = await fetch("/api/v1/discount/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode, productId: items[0].productId }),
    });
    const data = await res.json();
    setCheckingDiscount(false);
    if (!res.ok) { setDiscountErr(data.error); return; }
    setDiscountInfo(data.data);
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setPaying(true); setPayErr(null);

    const res = await fetch("/api/v1/checkout/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId })),
        paymentProvider: selectedPayment,
        discountCode: discountCode || undefined,
      }),
    });

    const data = await res.json();
    setPaying(false);

    if (!res.ok) { setPayErr(data.error ?? "Checkout failed"); return; }

    clearCart();
    if (data.data?.redirectUrl) {
      window.location.href = data.data.redirectUrl;
    }
  }

  if (items.length === 0) {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
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

      {/* Items */}
      <div className="space-y-2 mb-6">
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

      {/* Discount code */}
      <div className="glass-card p-5 mb-4">
        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
          <Tag size={14} /> Discount Code <span className="text-gray-600 text-xs">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            value={discountCode}
            onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
            placeholder="SAVE20"
            className="input-field flex-1 text-sm py-2"
          />
          <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()}
            className="btn-secondary text-sm px-4 py-2">
            {checkingDiscount ? "…" : "Apply"}
          </button>
        </div>
        {discountErr && <p className="text-red-400 text-xs mt-2">{discountErr}</p>}
        {discountInfo && (
          <p className="text-green-400 text-xs mt-2">
            ✅ {discountInfo.type === "PERCENTAGE" ? `${discountInfo.value}% off` : `$${discountInfo.value} off`} — saving ${discountInfo.discountAmount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Order summary */}
      <div className="glass-card p-5 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Order Summary</p>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-400">
              <span className="truncate mr-4">{item.title}</span>
              <span className="shrink-0">${item.price.toFixed(2)}</span>
            </div>
          ))}
          {discount > 0 && (
            <div className="flex justify-between text-green-400 border-t border-white/5 pt-2">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2 text-base">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="glass-card p-5 mb-5">
        <p className="text-sm font-medium text-white mb-3">Payment Method</p>
        <div className="space-y-2">
          {/* Crypto */}
          <button
            onClick={() => setSelectedPayment("nowpayments")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
            style={{
              background: selectedPayment === "nowpayments" ? "rgba(251,146,60,0.08)" : "rgba(255,255,255,0.03)",
              border: selectedPayment === "nowpayments" ? "1px solid rgba(251,146,60,0.4)" : "1px solid rgba(255,255,255,0.07)",
            }}>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Bitcoin size={18} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Crypto Payment</p>
              <p className="text-xs text-gray-500">BTC, ETH, USDT, 100+ coins — pay the full total at once</p>
            </div>
            {selectedPayment === "nowpayments" && <CheckCircle size={16} className="text-orange-400 shrink-0" />}
          </button>

          {/* Balance */}
          {balance !== null && (
            <button
              onClick={() => canPayWithBalance && setSelectedPayment("balance")}
              disabled={!canPayWithBalance}
              className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
              style={{
                background: selectedPayment === "balance" ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.03)",
                border: selectedPayment === "balance" ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.07)",
                opacity: canPayWithBalance ? 1 : 0.4,
                cursor: canPayWithBalance ? "pointer" : "not-allowed",
              }}>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Wallet Balance</p>
                <p className="text-xs text-gray-500">
                  Available: ${balance.toFixed(2)}{!canPayWithBalance ? " — insufficient" : " — instant delivery"}
                </p>
              </div>
              {selectedPayment === "balance" && <CheckCircle size={16} className="text-cyan-400 shrink-0" />}
            </button>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 flex-wrap mb-5">
        {[{ icon: "🔒", text: "Secure Payment" }, { icon: "⚡", text: "Instant Delivery" }, { icon: "🔄", text: "Replacement Guarantee" }].map((b) => (
          <div key={b.text} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span>{b.icon}</span><span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {payErr && <p className="text-red-400 text-sm text-center mb-4">{payErr}</p>}

      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-base transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", boxShadow: "0 4px 24px rgba(167,139,250,0.2)" }}>
        {paying ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
        {paying ? "Processing…" : `Pay $${finalTotal.toFixed(2)} — ${items.length} Item${items.length !== 1 ? "s" : ""}`}
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        One payment for all items. All products delivered to your email instantly.
      </p>

      {/* Also browse more */}
      <div className="flex justify-center mt-6">
        <Link href="/products" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-400 transition-colors">
          Continue shopping <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
