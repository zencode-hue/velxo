"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bitcoin, MessageCircle, Tag, ArrowRight, Loader2, Wallet, ExternalLink, CreditCard } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; discountAmount: number } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetch(`/api/v1/products/${productId}`).then((r) => r.json()),
      fetch("/api/v1/balance").then((r) => r.json()).catch(() => null),
    ]).then(([productData, balanceData]) => {
      setProduct(productData.data?.product ?? null);
      if (balanceData?.data?.balance !== undefined) setBalance(balanceData.data.balance);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const finalPrice = product ? Math.max(0, product.price - (discountInfo?.discountAmount ?? 0)) : 0;
  const canPayWithBalance = balance !== null && balance >= finalPrice;

  async function applyDiscount() {
    if (!discountCode.trim() || !productId) return;
    setCheckingDiscount(true); setDiscountErr(null);
    const res = await fetch("/api/v1/discount/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode, productId }),
    });
    const data = await res.json();
    setCheckingDiscount(false);
    if (!res.ok) { setDiscountErr(data.error); return; }
    setDiscountInfo(data.data);
  }

  async function handlePay(provider: "nowpayments" | "discord" | "balance" | "binance_gift_card" | "flutterwave") {
    if (!productId) return;
    setPaying(true); setPayErr(null);
    const res = await fetch("/api/v1/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, paymentProvider: provider, discountCode: discountCode || undefined }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) { setPayErr(data.error); return; }
    if (provider === "binance_gift_card" && (data.data?.orderId || data.data?.codeSubmitUrl)) {
      // Redirect to invoice — the InvoiceClient handles the full gift card flow
      const orderId = data.data.orderId;
      window.location.href = `/invoice/${orderId}`;
      return;
    }
    if (data.data?.redirectUrl) window.location.href = data.data.redirectUrl;
  }

  if (!productId) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No product selected. <Link href="/products" className="text-purple-400 ml-2">Browse products</Link>
    </div>
  );
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Product not found. <Link href="/products" className="text-purple-400 ml-2">Browse products</Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.06) 0%, transparent 60%)" }} />
      <div className="w-full max-w-lg relative z-10 space-y-5">
        <h1 className="text-2xl font-bold text-white">Checkout</h1>

        <div className="glass-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
            <p className="font-semibold text-white">{product.title}</p>
          </div>
          <div className="text-right shrink-0">
            {discountInfo && <p className="text-xs text-gray-500 line-through">${product.price.toFixed(2)}</p>}
            <p className="text-xl font-bold text-white">${finalPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
            <Tag size={14} /> Discount Code
          </label>
          <div className="flex gap-2">
            <input type="text" value={discountCode}
              onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
              placeholder="SAVE20" className="input-field flex-1 text-sm py-2" />
            <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()} className="btn-secondary text-sm px-4 py-2">
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

        <div className="glass-card p-5 space-y-3">
          <p className="text-sm text-gray-400 font-medium">Choose payment method</p>

          {/* Balance */}
          {balance !== null && (
            <button onClick={() => handlePay("balance")} disabled={paying || !canPayWithBalance}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${canPayWithBalance ? "border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5" : "border-white/5 opacity-50 cursor-not-allowed"}`}>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Wallet size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Pay with Balance</p>
                <p className="text-xs text-gray-500">
                  {canPayWithBalance ? `Available: $${balance.toFixed(2)} — instant delivery` : `Insufficient balance ($${balance.toFixed(2)})`}
                </p>
              </div>
              {canPayWithBalance && <ArrowRight size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />}
            </button>
          )}

          {/* Binance Gift Card */}
          <button onClick={() => handlePay("binance_gift_card")} disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Card Payment (Key)</p>
              <p className="text-xs text-gray-500">Buy a ${finalPrice.toFixed(2)} USDT gift card on Eneba and redeem here</p>
            </div>
            <ExternalLink size={16} className="text-gray-600 group-hover:text-yellow-400 transition-colors" />
          </button>

          <button onClick={() => handlePay("nowpayments")} disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Bitcoin size={20} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Crypto Payment</p>
              <p className="text-xs text-gray-500">BTC, ETH, USDT, and 100+ coins via NOWPayments</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
          </button>

          <button onClick={() => handlePay("discord")} disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Pay via Discord</p>
              <p className="text-xs text-gray-500">Join our server and complete payment manually</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
          </button>

          <button onClick={() => handlePay("flutterwave")} disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-green-500/40 hover:bg-green-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Card / Apple Pay / Google Pay</p>
              <p className="text-xs text-gray-500">Visa, Mastercard, and more via Flutterwave</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-green-400 transition-colors" />
          </button>
        </div>

        {paying && (
          <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Processing…
          </div>
        )}
        {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}
        <p className="text-center text-xs text-gray-600">By purchasing you agree to our terms. All sales are final for digital products.</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutPageInner /></Suspense>;
}
