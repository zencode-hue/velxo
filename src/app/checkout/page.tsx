"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bitcoin, MessageCircle, Tag, ArrowRight, Loader2, Wallet, CreditCard, ExternalLink, ChevronRight, Check, X } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl?: string | null;
}

// North America country codes — hide gift card for these
const NA_COUNTRIES = ["US", "CA", "MX"];

function GiftCardInstructions({ amount, orderId, onClose }: { amount: number; orderId: string; onClose: () => void }) {
  const [step, setStep] = useState<"instructions" | "code">("instructions");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const denomStr = amount % 1 === 0 ? String(amount) : amount.toFixed(1).replace(".", "-");
  const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/v1/checkout/binance-gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, giftCardCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit"); return; }
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(17,17,17,0.98)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(52,211,153,0.15)" }}>
              <Check size={28} style={{ color: "#34d399" }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Code Submitted!</h3>
            <p className="text-sm text-gray-400 mb-4">Our team is verifying your gift card. You&apos;ll receive your product via email once approved.</p>
            <Link href={`/invoice/${orderId}`} className="btn-primary text-sm px-6 py-2.5 inline-flex">
              View Invoice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: "rgba(17,17,17,0.98)", border: "1px solid rgba(240,185,11,0.25)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h3 className="font-bold text-white">Pay with Binance Gift Card</h3>
            <p className="text-xs text-gray-500 mt-0.5">${amount} USD card required</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 text-xs">
          <button onClick={() => setStep("instructions")}
            className="px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: step === "instructions" ? "rgba(240,185,11,0.15)" : "rgba(255,255,255,0.04)", color: step === "instructions" ? "#f0b90b" : "rgba(255,255,255,0.4)", border: step === "instructions" ? "1px solid rgba(240,185,11,0.25)" : "1px solid transparent" }}>
            1. How to buy
          </button>
          <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.2)" }} />
          <button onClick={() => setStep("code")}
            className="px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: step === "code" ? "rgba(240,185,11,0.15)" : "rgba(255,255,255,0.04)", color: step === "code" ? "#f0b90b" : "rgba(255,255,255,0.4)", border: step === "code" ? "1px solid rgba(240,185,11,0.25)" : "1px solid transparent" }}>
            2. Submit code
          </button>
        </div>

        <div className="p-5">
          {step === "instructions" && (
            <div className="space-y-4">
              <ol className="space-y-3">
                {[
                  { n: 1, text: `Click the button below to open Eneba and purchase a $${amount} USD Binance Gift Card.` },
                  { n: 2, text: "Complete the purchase on Eneba. You'll receive a gift card code (e.g. XXXX-XXXX-XXXX-XXXX) via email." },
                  { n: 3, text: "Come back here and click \"I have my code\" to enter it." },
                  { n: 4, text: "Our staff will verify the code and deliver your product within minutes." },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: "rgba(240,185,11,0.15)", color: "#f0b90b" }}>{n}</span>
                    {text}
                  </li>
                ))}
              </ol>
              <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(240,185,11,0.06)", border: "1px solid rgba(240,185,11,0.15)", color: "#fde68a" }}>
                ⚠️ Purchase exactly a <strong>${amount} USD</strong> Binance Gift Card. Other amounts won&apos;t be accepted.
              </div>
              <a href={enebaUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#f0b90b", color: "#000" }}>
                <ExternalLink size={15} /> Buy ${amount} USD Gift Card on Eneba
              </a>
              <button onClick={() => setStep("code")}
                className="w-full py-2.5 rounded-xl text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                I already have my code →
              </button>
              {/* Support link */}
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                Need help?{" "}
                <a href="https://discord.gg/metramart" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                  Ask on Discord
                </a>
              </p>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Paste your Binance Gift Card code
                </label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="input-field font-mono tracking-widest text-sm" autoFocus />
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Enter the code exactly as shown after purchase on Eneba.
                </p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={submitCode} disabled={submitting || !code.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: "#f0b90b", color: "#000" }}>
                {submitting ? <Loader2 size={15} className="animate-spin" /> : "Submit Gift Card Code"}
              </button>
              <button onClick={() => setStep("instructions")}
                className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
                ← Back to instructions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const variantIdParam = searchParams.get("variantId");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; name: string; price: number } | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; discountAmount: number } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);
  const [giftCardModal, setGiftCardModal] = useState<{ orderId: string; amount: number } | null>(null);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetch(`/api/v1/products/${productId}`).then((r) => r.json()),
      fetch("/api/v1/balance").then((r) => r.json()).catch(() => null),
      // Detect country for payment method filtering
      fetch("https://ipapi.co/json/").then((r) => r.json()).catch(() => null),
    ]).then(([productData, balanceData, geoData]) => {
      const p = productData.data?.product ?? null;
      setProduct(p);
      if (balanceData?.data?.balance !== undefined) setBalance(balanceData.data.balance);
      if (geoData?.country_code) setCountry(geoData.country_code);
      // Auto-select variant from URL param
      if (p?.variants?.length && variantIdParam) {
        const v = p.variants.find((v: { id: string }) => v.id === variantIdParam);
        if (v) setSelectedVariant(v);
      } else if (p?.variants?.length) {
        const first = p.variants.find((v: { inStock: boolean }) => v.inStock) ?? p.variants[0];
        setSelectedVariant(first);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const finalPrice = product
    ? Math.max(0, (selectedVariant ? selectedVariant.price : product.price) - (discountInfo?.discountAmount ?? 0))
    : 0;
  const canPayWithBalance = balance !== null && balance >= finalPrice;
  const isNorthAmerica = country ? NA_COUNTRIES.includes(country) : false;

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
      body: JSON.stringify({ productId, variantId: selectedVariant?.id ?? variantIdParam ?? undefined, paymentProvider: provider, discountCode: discountCode || undefined }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) { setPayErr(data.error); return; }

    if (provider === "binance_gift_card") {
      // Show inline instructions modal instead of redirecting
      setGiftCardModal({ orderId: data.data.orderId, amount: data.data.denomination ?? finalPrice });
      return;
    }
    if (data.data?.redirectUrl) window.location.href = data.data.redirectUrl;
  }

  if (!productId) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No product selected. <Link href="/products" className="text-amber-400 ml-2">Browse products</Link>
    </div>
  );
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-amber-400" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Product not found. <Link href="/products" className="text-amber-400 ml-2">Browse products</Link>
    </div>
  );

  return (
    <>
      {giftCardModal && (
        <GiftCardInstructions
          amount={giftCardModal.amount}
          orderId={giftCardModal.orderId}
          onClose={() => setGiftCardModal(null)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.06) 0%, transparent 60%)" }} />
        <div className="w-full max-w-lg relative z-10 space-y-5">
          <h1 className="text-2xl font-bold text-white">Checkout</h1>

          <div className="glass-card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{product.category}</p>
              <p className="font-semibold text-white">{product.title}</p>
              {selectedVariant && <p className="text-xs text-amber-400 mt-0.5">{selectedVariant.name}</p>}
            </div>
            <div className="text-right shrink-0">
              {discountInfo && <p className="text-xs text-gray-500 line-through">${(selectedVariant ? selectedVariant.price : product.price).toFixed(2)}</p>}
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

            {/* Binance Gift Card — hidden for North America */}
            {!isNorthAmerica && (
              <button onClick={() => handlePay("binance_gift_card")} disabled={paying}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <CreditCard size={20} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">Card Payment (Key)</p>
                  <p className="text-xs text-gray-500">Buy a ${finalPrice.toFixed(2)} USDT gift card on Eneba and redeem here</p>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-yellow-400 transition-colors" />
              </button>
            )}

            {/* Crypto */}
            <button onClick={() => handlePay("nowpayments")} disabled={paying}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Bitcoin size={20} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Crypto Payment</p>
                <p className="text-xs text-gray-500">BTC, ETH, USDT, and 100+ coins via NOWPayments</p>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-orange-400 transition-colors" />
            </button>

            {/* Discord */}
            <button onClick={() => handlePay("discord")} disabled={paying}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Pay via Discord</p>
                <p className="text-xs text-gray-500">Join our server and complete payment manually</p>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>

          {paying && (
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Processing…
            </div>
          )}
          {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}

          <div className="flex items-center justify-center gap-6 flex-wrap pt-2">
            {[{ icon: "🔒", text: "Secure Payment" }, { icon: "⚡", text: "Instant Delivery" }, { icon: "🔄", text: "Replacement Guarantee" }].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600">By purchasing you agree to our terms. All sales are final for digital products.</p>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutPageInner /></Suspense>;
}
