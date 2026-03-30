"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bitcoin, MessageCircle, Tag, ArrowRight, Loader2, Wallet, Shield, Zap, CheckCircle, Package, ExternalLink, CreditCard } from "lucide-react";

interface Product {
  id: string; title: string; price: number; category: string;
  imageUrl?: string | null; description: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

function ConfirmPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const qty = parseInt(searchParams.get("qty") ?? "1", 10);

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
    ]).then(([pd, bd]) => {
      setProduct(pd.data?.product ?? null);
      if (bd?.data?.balance !== undefined) setBalance(bd.data.balance);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const basePrice = product ? product.price * qty : 0;
  const discount = discountInfo?.discountAmount ?? 0;
  const finalPrice = Math.max(0, basePrice - discount);
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

  async function handlePay(provider: "nowpayments" | "discord" | "balance" | "binance_gift_card") {
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
    if (provider === "binance_gift_card" && data.data?.codeSubmitUrl) {
      window.open(data.data.redirectUrl, "_blank");
      window.location.href = data.data.codeSubmitUrl;
      return;
    }
    if (data.data?.redirectUrl) window.location.href = data.data.redirectUrl;
    else if (data.data?.orderId) router.push(`/orders/${data.data.orderId}`);
  }

  if (!productId) return <div className="min-h-screen flex items-center justify-center text-gray-500">No product selected. <Link href="/products" className="text-purple-400 ml-2">Browse</Link></div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-purple-400" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found. <Link href="/products" className="text-purple-400 ml-2">Browse</Link></div>;

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 50%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/products/${productId}`} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1 mb-4">
            ← Back to product
          </Link>
          <h1 className="text-2xl font-bold text-white">Complete Your Order</h1>
          <p className="text-gray-500 text-sm mt-1">Review your order and choose a payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Order summary */}
          <div className="lg:col-span-3 space-y-4">
            {/* Product card */}
            <div className="rounded-2xl p-5 flex gap-4" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Package size={28} className="text-purple-400/50" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500">{CATEGORY_LABELS[product.category]}</span>
                <h3 className="font-bold text-white text-sm mt-0.5 leading-snug">{product.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">Qty: {qty}</span>
                  <span className="text-sm font-bold text-white">${(product.price * qty).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* What you get */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold text-white mb-3">What you get:</p>
              <div className="space-y-2">
                {[
                  "Instant delivery to your email after payment",
                  "Encrypted credentials / license key",
                  "Replacement if credentials are invalid",
                  "24/7 support via Discord",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount code */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                <Tag size={14} className="text-purple-400" /> Discount Code
              </label>
              <div className="flex gap-2">
                <input type="text" value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
                  placeholder="Enter code..." className="input-field flex-1 text-sm py-2.5" />
                <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)" }}>
                  {checkingDiscount ? "…" : "Apply"}
                </button>
              </div>
              {discountErr && <p className="text-red-400 text-xs mt-2">{discountErr}</p>}
              {discountInfo && <p className="text-green-400 text-xs mt-2">✅ Discount applied — saving ${discountInfo.discountAmount.toFixed(2)}</p>}
            </div>
          </div>

          {/* Right — Payment */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order total */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold text-white mb-4">Order Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({qty}x)</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold text-white">Payment Method</p>

              {balance !== null && (
                <button onClick={() => handlePay("balance")} disabled={paying || !canPayWithBalance}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${canPayWithBalance ? "border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5" : "border-white/5 opacity-40 cursor-not-allowed"}`}>
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0">
                    <Wallet size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Wallet Balance</p>
                    <p className="text-xs text-gray-500">{canPayWithBalance ? `$${balance.toFixed(2)} available` : `Insufficient ($${balance.toFixed(2)})`}</p>
                  </div>
                  {canPayWithBalance && <ArrowRight size={14} className="text-gray-600 shrink-0" />}
                </button>
              )}

              {/* Binance Gift Card */}
              <button onClick={() => handlePay("binance_gift_card")} disabled={paying}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-left group">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <CreditCard size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Card Payment (Key)</p>
                  <p className="text-xs text-gray-500">Buy a ${finalPrice.toFixed(2)} USDT gift card on Eneba</p>
                </div>
                <ExternalLink size={14} className="text-gray-600 group-hover:text-yellow-400 transition-colors shrink-0" />
              </button>

              <button onClick={() => handlePay("nowpayments")} disabled={paying}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left group">
                <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Bitcoin size={16} className="text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Crypto</p>
                  <p className="text-xs text-gray-500">BTC, ETH, USDT, 100+ coins</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-orange-400 transition-colors shrink-0" />
              </button>

              <button onClick={() => handlePay("discord")} disabled={paying}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Discord</p>
                  <p className="text-xs text-gray-500">Manual payment via Discord</p>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" />
              </button>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 opacity-30 cursor-not-allowed">
                <div className="w-9 h-9 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                  <CreditCard size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Card / Apple Pay</p>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Shield size={11} className="text-green-400" /> Secure</span>
              <span className="flex items-center gap-1"><Zap size={11} className="text-yellow-400" /> Instant</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-blue-400" /> Guaranteed</span>
            </div>

            {paying && (
              <div className="flex items-center justify-center gap-2 text-purple-400 text-sm py-2">
                <Loader2 size={16} className="animate-spin" /> Processing your order…
              </div>
            )}
            {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}
            <p className="text-center text-xs text-gray-700">All sales final for digital products.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmPageInner /></Suspense>;
}
