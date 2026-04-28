"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ExternalLink, Loader2, CheckCircle, Copy, ChevronRight, CreditCard } from "lucide-react";

function GiftCardPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") ?? "";
  const amount = searchParams.get("amount") ?? "";

  const denomStr = Number(amount) % 1 === 0
    ? String(Number(amount))
    : Number(amount).toFixed(1).replace(".", "-");
  const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;

  const [step, setStep] = useState<"instructions" | "code">("instructions");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/v1/checkout/binance-gift-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, giftCardCode: code.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 4000);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle size={48} className="text-green-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Code Submitted!</h2>
          <p className="text-gray-400 text-sm">
            Your gift card code has been received. Our team will verify and process your order shortly.
            You&apos;ll be redirected to your dashboard in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(240,185,11,0.05) 0%, transparent 60%)" }} />
      <div className="w-full max-w-lg relative z-10 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <CreditCard size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Card Payment (Key)</h1>
            <p className="text-xs text-gray-500">Order VLX-{orderId.slice(-6).toUpperCase()} · ${amount} USD</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-3 py-1 rounded-full font-medium ${step === "instructions" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-500"}`}>
            1. Buy Card
          </span>
          <ChevronRight size={12} className="text-gray-600" />
          <span className={`px-3 py-1 rounded-full font-medium ${step === "code" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-500"}`}>
            2. Submit Code
          </span>
        </div>

        {step === "instructions" && (
          <div className="space-y-4">
            {/* Instructions card */}
            <div className="glass-card p-5 space-y-4">
              <h2 className="font-semibold text-white text-sm">How to pay with Binance Gift Card</h2>
              <ol className="space-y-3">
                {[
                  { n: 1, text: `Click the button below to open Eneba and purchase a $${amount} USD Binance Gift Card.` },
                  { n: 2, text: "Complete the purchase on Eneba. You'll receive a gift card code (looks like: XXXX-XXXX-XXXX-XXXX)." },
                  { n: 3, text: "Come back to this page and click \"I have my code\" to enter the code." },
                  { n: 4, text: "We'll verify the code and deliver your order automatically." },
                ].map(({ n, text }) => (
                  <li key={n} className="flex gap-3 text-sm text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Warning */}
            <div className="glass-card p-4 border border-yellow-500/20 bg-yellow-500/5">
              <p className="text-xs text-yellow-300">
                ⚠️ Make sure to purchase exactly a <strong>${amount} USD</strong> Binance Gift Card. Other amounts will not be accepted for this order.
              </p>
            </div>

            {/* CTA */}
            <a
              href={enebaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors"
            >
              <ExternalLink size={16} />
              Buy ${amount} USD Gift Card on Eneba
            </a>

            <button
              onClick={() => setStep("code")}
              className="w-full py-3 px-5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 text-sm transition-colors"
            >
              I already have my code →
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h2 className="font-semibold text-white text-sm">Enter your Binance Gift Card code</h2>
              <p className="text-xs text-gray-400">
                Paste the code exactly as shown on Eneba after purchase. It typically looks like <code className="bg-white/5 px-1 rounded">XXXX-XXXX-XXXX-XXXX</code>.
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="input-field w-full text-sm py-3 pr-10 font-mono tracking-widest"
                  autoFocus
                />
                {code && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(code); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={submitCode}
                disabled={submitting || !code.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Gift Card Code"}
              </button>
            </div>

            <button
              onClick={() => setStep("instructions")}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              ← Back to instructions
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-600">
          Need help? Contact our support. Do not share your gift card code anywhere else.
        </p>
      </div>
    </div>
  );
}

export default function GiftCardPage() {
  return <Suspense><GiftCardPageInner /></Suspense>;
}
