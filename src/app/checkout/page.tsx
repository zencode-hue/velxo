"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Bitcoin, MessageCircle, Tag, ArrowRight, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; discountAmount: number } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/v1/products/${productId}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d.data?.product ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const finalPrice = product
    ? Math.max(0, product.price - (discountInfo?.discountAmount ?? 0))
    : 0;

  async function applyDiscount() {
    if (!discountCode.trim() || !productId) return;
    setCheckingDiscount(true);
    setDiscountErr(null);
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

  async function handlePay(provider: "nowpayments" | "discord") {
    if (!productId) return;
    setPaying(true);
    setPayErr(null);
    const res = await fetch("/api/v1/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, paymentProvider: provider, discountCode: discountCode || undefined }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) { setPayErr(data.error); return; }
    if (data.data?.redirectUrl) {
      window.location.href = data.data.redirectUrl;
    }
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
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.06) 0%, transparent 60%)"
      }} />

      <div className="w-full max-w-lg relative z-10 space-y-5">
        <h1 className="text-2xl font-bold text-white">Checkout</h1>

        {/* Product summary */}
        <div className="glass-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
            <p className="font-semibold text-white">{product.title}</p>
          </div>
          <div className="text-right shrink-0">
            {discountInfo && (
              <p className="text-xs text-gray-500 line-through">${product.price.toFixed(2)}</p>
            )}
            <p className="text-xl font-bold text-white">${finalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Discount code */}
        <div className="glass-card p-5">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
            <Tag size={14} /> Discount Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
              placeholder="SAVE20"
              className="input-field flex-1 text-sm py-2"
            />
            <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()} className="btn-secondary text-sm px-4 py-2">
              {checkingDiscount ? "…" : "Apply"}
            </button>
          </div>
          {discountErr && <p className="text-red-400 text-xs mt-2">{discountErr}</p>}
          {discountInfo && (
            <p className="text-green-400 text-xs mt-2">
              ✅ {discountInfo.type === "PERCENTAGE" ? `${discountInfo.value}% off` : `$${discountInfo.value} off`} applied — saving ${discountInfo.discountAmount.toFixed(2)}
            </p>
          )}
        </div>

        {/* Payment methods */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-sm text-gray-400 font-medium mb-3">Choose payment method</p>

          {/* Crypto via NOWPayments */}
          <button
            onClick={() => handlePay("nowpayments")}
            disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-purple-600/40 hover:bg-purple-600/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Bitcoin size={20} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Crypto Payment</p>
              <p className="text-xs text-gray-500">BTC, ETH, USDT, and 100+ coins via NOWPayments</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Discord manual payment */}
          <button
            onClick={() => handlePay("discord")}
            disabled={paying}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-purple-600/40 hover:bg-purple-600/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Pay via Discord</p>
              <p className="text-xs text-gray-500">Join our server and complete payment manually</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
          </button>

          {/* Coming soon */}
          <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 opacity-40 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center shrink-0">
              <span className="text-lg">💳</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Card / Apple Pay / Google Pay</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
            <span className="badge-purple text-xs">Soon</span>
          </div>
        </div>

        {paying && (
          <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Redirecting…
          </div>
        )}
        {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}

        <p className="text-center text-xs text-gray-600">
          By purchasing you agree to our terms. All sales are final for digital products.
        </p>
      </div>
    </div>
  );
}
