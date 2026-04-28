"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bitcoin, MessageCircle, Tag, ArrowRight, Loader2, Wallet,
  Shield, Zap, CheckCircle, Package, ExternalLink, CreditCard,
  Mail, ChevronRight, Copy, Check,
} from "lucide-react";

interface Product {
  id: string; title: string; price: number; category: string;
  imageUrl?: string | null; description: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

const PAYMENT_METHODS = [
  { id: "balance", label: "Wallet Balance", sub: "", icon: Wallet, color: "cyan" },
  { id: "binance_gift_card", label: "Card Payment (Key)", sub: "Binance USDT Gift Card via Eneba", icon: CreditCard, color: "yellow" },
  { id: "nowpayments", label: "Crypto", sub: "BTC, ETH, USDT, 100+ coins", icon: Bitcoin, color: "orange" },
  { id: "discord", label: "Discord Manual", sub: "Pay manually via Discord", icon: MessageCircle, color: "indigo" },
] as const;

type PaymentProvider = "nowpayments" | "discord" | "balance" | "binance_gift_card";

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Order Info" },
    { n: 2, label: "Confirm & Pay" },
    { n: 3, label: "Receive Items" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > s.n ? "bg-green-500 text-white" :
              step === s.n ? "text-white" : "bg-white/5 text-gray-600"
            }`} style={step === s.n ? { background: "linear-gradient(135deg, #ea580c, #f97316)" } : {}}>
              {step > s.n ? <Check size={14} /> : s.n}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step === s.n ? "text-white" : step > s.n ? "text-green-400" : "text-gray-600"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-all ${step > s.n ? "bg-green-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ConfirmPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const qty = parseInt(searchParams.get("qty") ?? "1", 10);
  const dealPriceParam = searchParams.get("dealPrice");
  const dealPrice = dealPriceParam ? parseFloat(dealPriceParam) : null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ value: number; type: string; discountAmount: number } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentProvider | null>(null);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetch(`/api/v1/products/${productId}`).then((r) => r.json()),
      fetch("/api/v1/balance").then((r) => r.json()).catch(() => null),
    ]).then(([pd, bd]) => {
      setProduct(pd.data?.product ?? null);
      if (bd?.data?.balance !== undefined) {
        setBalance(bd.data.balance);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  const basePrice = product ? (dealPrice ?? product.price) * qty : 0;
  const discount = discountInfo?.discountAmount ?? 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const isDealPrice = dealPrice !== null && product && dealPrice < product.price;
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

  function validateStep1(): string | null {
    if (isGuest && !guestEmail.trim()) return "Please enter your email address";
    if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) return "Please enter a valid email address";
    return null;
  }

  async function handlePay() {
    if (!productId || !selectedPayment) return;
    setPaying(true); setPayErr(null);
    const res = await fetch("/api/v1/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId, paymentProvider: selectedPayment,
        discountCode: discountCode || undefined,
        ...(isGuest ? { guestEmail: guestEmail.trim() } : {}),
      }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) { setPayErr(data.error); return; }

    if (selectedPayment === "binance_gift_card" && data.data?.orderId) {
      // Redirect to invoice — InvoiceClient handles the full gift card flow inline
      window.location.href = `/invoice/${data.data.orderId}`;
      return;
    }
    if (selectedPayment === "balance" && data.data?.orderId) {
      setInvoiceId(data.data.orderId);
      setStep(3);
      return;
    }
    if (data.data?.redirectUrl) {
      window.location.href = data.data.redirectUrl;
      return;
    }
    if (data.data?.orderId) {
      setInvoiceId(data.data.orderId);
      setStep(3);
    }
  }

  function copyInvoice() {
    if (!invoiceId) return;
    navigator.clipboard.writeText(invoiceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!productId) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No product selected. <Link href="/products" className="text-purple-400 ml-2">Browse</Link>
    </div>
  );
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Product not found. <Link href="/products" className="text-purple-400 ml-2">Browse</Link>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 50%)" }}>
      <div className="max-w-2xl mx-auto">
        <Link href={product ? `/products/${product.id}` : "/products"} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1 mb-8">
          ← Back to product
        </Link>

        <StepIndicator step={step} />

        {/* Product summary — always visible */}
        <div className="rounded-2xl p-4 mb-6 flex gap-4 items-center" style={{ background: "rgba(17,17,17,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"><Package size={22} className="text-purple-400/50" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">{CATEGORY_LABELS[product.category]}</p>
            <p className="font-semibold text-white text-sm truncate">{product.title}</p>
          </div>
          <div className="text-right shrink-0">
            {isDealPrice && <p className="text-xs line-through text-gray-600">${(product.price * qty).toFixed(2)}</p>}
            <p className="font-bold text-white">${finalPrice.toFixed(2)}</p>
            {discount > 0 && <p className="text-xs text-green-400">-${discount.toFixed(2)} off</p>}
          </div>
        </div>

        {/* ── STEP 1: Order Information ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Email */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Mail size={15} className="text-purple-400" /> Delivery Email
              </label>
              {isGuest ? (
                <>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field text-sm py-3 w-full"
                    autoComplete="email"
                  />
                  <p className="text-xs text-gray-600 mt-2">Your credentials will be delivered to this email instantly after payment.</p>
                  <Link href="/auth/login" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">
                    Sign in for faster checkout →
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <CheckCircle size={14} className="text-green-400 shrink-0" />
                  <p className="text-sm text-gray-300">Delivery to your account email</p>
                </div>
              )}
            </div>

            {/* Discount code */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Tag size={15} className="text-purple-400" /> Discount Code <span className="text-gray-600 font-normal text-xs">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
                  placeholder="Enter code..."
                  className="input-field flex-1 text-sm py-2.5"
                />
                <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)" }}>
                  {checkingDiscount ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                </button>
              </div>
              {discountErr && <p className="text-red-400 text-xs mt-2">{discountErr}</p>}
              {discountInfo && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <CheckCircle size={11} /> Discount applied — saving ${discountInfo.discountAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold text-white mb-3">Invoice Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2">
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const err = validateStep1();
                if (err) { setPayErr(err); return; }
                setPayErr(null);
                setStep(2);
              }}
              className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 4px 20px rgba(234,88,12,0.3)" }}>
              Continue to Payment <ChevronRight size={18} />
            </button>
            {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}
          </div>
        )}

        {/* ── STEP 2: Confirm & Pay ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm font-semibold text-white mb-4">Choose Payment Method</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => {
                  const isBalance = m.id === "balance";
                  const disabled = isBalance && (!canPayWithBalance || isGuest);
                  const selected = selectedPayment === m.id;
                  const colorMap: Record<string, string> = {
                    cyan: "border-cyan-500/40 bg-cyan-500/5",
                    yellow: "border-yellow-500/40 bg-yellow-500/5",
                    orange: "border-orange-500/40 bg-orange-500/5",
                    indigo: "border-indigo-500/40 bg-indigo-500/5",
                  };
                  const iconColorMap: Record<string, string> = {
                    cyan: "text-cyan-400 bg-cyan-500/15",
                    yellow: "text-yellow-400 bg-yellow-500/15",
                    orange: "text-orange-400 bg-orange-500/15",
                    indigo: "text-indigo-400 bg-indigo-500/15",
                  };
                  return (
                    <button
                      key={m.id}
                      onClick={() => !disabled && setSelectedPayment(m.id as PaymentProvider)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        disabled ? "opacity-30 cursor-not-allowed border-white/5" :
                        selected ? colorMap[m.color] + " border-2" : "border-white/8 hover:" + colorMap[m.color]
                      }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconColorMap[m.color]}`}>
                        <m.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{m.label}</p>
                        <p className="text-xs text-gray-500">
                          {isBalance && !isGuest ? `Balance: $${(balance ?? 0).toFixed(2)}${!canPayWithBalance ? " (insufficient)" : ""}` : m.sub}
                        </p>
                      </div>
                      {selected && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Shield size={11} className="text-green-400" /> Secure</span>
              <span className="flex items-center gap-1"><Zap size={11} className="text-yellow-400" /> Instant</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-blue-400" /> Guaranteed</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-5 py-3.5 rounded-xl font-medium text-gray-400 border border-white/10 hover:text-white hover:border-white/20 transition-all text-sm">
                ← Back
              </button>
              <button
                onClick={handlePay}
                disabled={paying || !selectedPayment}
                className="flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: selectedPayment ? "0 4px 20px rgba(234,88,12,0.3)" : "none" }}>
                {paying ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Proceed to Payment <ArrowRight size={16} /></>}
              </button>
            </div>
            {payErr && <p className="text-red-400 text-sm text-center">{payErr}</p>}
            <p className="text-center text-xs text-gray-700">All sales final for digital products.</p>
          </div>
        )}

        {/* ── STEP 3: Receive Items ── */}
        {step === 3 && invoiceId && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Order Confirmed!</h2>
              <p className="text-gray-400 text-sm">Your credentials are being delivered to your email.</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Invoice ID</p>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Reference</p>
                  <code className="font-mono text-sm text-purple-300">VLX-{invoiceId.slice(-6).toUpperCase()}</code>
                </div>
                <button onClick={copyInvoice} className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">Save this — you can use it to track your order or get support.</p>
            </div>

            <div className="flex gap-3">
              <Link href={`/invoice/${invoiceId}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
                <ExternalLink size={14} /> View Invoice
              </Link>
              <Link href="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 transition-all">
                My Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return <Suspense><ConfirmPageInner /></Suspense>;
}
