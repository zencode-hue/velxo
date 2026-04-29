"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Copy, Check, ChevronRight, Loader2, MessageCircle, CreditCard, Bitcoin, Wallet, Clock } from "lucide-react";
import { formatOrderId } from "@/lib/slug";

interface InvoiceClientProps {
  orderId: string;
  status: string;
  paymentProvider: string;
  amount: number;
  paymentRef?: string | null;
  giftCardDenomination?: number;
}

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/2b8AkfW6EP";

export default function InvoiceClient({ orderId, status, paymentProvider, amount, paymentRef, giftCardDenomination }: InvoiceClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "PENDING") return;
    const interval = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(interval);
  }, [status, router]);

  if (status !== "PENDING") {
    if (status === "PENDING_STOCK" && paymentProvider === "binance_gift_card") {
      return (
        <>
          <GiftCardPendingSection orderId={orderId} />
          <SupportSection orderId={orderId} />
        </>
      );
    }
    return <SupportSection orderId={orderId} />;
  }

  return (
    <>
      {paymentProvider === "nowpayments" && <CryptoSection orderId={orderId} paymentRef={paymentRef} />}
      {paymentProvider === "binance_gift_card" && <GiftCardSection orderId={orderId} amount={amount} denomination={giftCardDenomination ?? amount} />}
      {paymentProvider === "discord" && <DiscordSection orderId={orderId} amount={amount} />}
      {paymentProvider === "balance" && <BalanceSection />}
      <SupportSection orderId={orderId} />
    </>
  );
}

// ── Gift Card Pending Approval ────────────────────────────────────────────────
function GiftCardPendingSection({ orderId }: { orderId: string }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(240,185,11,0.05)", border: "1px solid rgba(240,185,11,0.2)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(240,185,11,0.12)", border: "1px solid rgba(240,185,11,0.2)" }}>
          <Clock size={16} style={{ color: "#f0b90b" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Gift Card — Pending Staff Approval</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Your code has been received and is being verified</p>
        </div>
      </div>
      <div className="rounded-xl p-4 space-y-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.15)" }}>
            <Check size={11} style={{ color: "#34d399" }} />
          </div>
          Gift card code received by our team
        </div>
        <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 animate-pulse" style={{ background: "rgba(240,185,11,0.15)" }}>
            <Clock size={11} style={{ color: "#f0b90b" }} />
          </div>
          Staff verifying and approving your payment
        </div>
        <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "10px" }}>📧</span>
          </div>
          Product delivered to your email once approved
        </div>
      </div>
      <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
        Reference: <span className="font-mono text-purple-300">{formatOrderId(orderId)}</span>
      </p>
    </div>
  );
}

// ── Crypto (NOWPayments) ──────────────────────────────────────────────────────
function CryptoSection({ orderId: _orderId, paymentRef }: { orderId: string; paymentRef?: string | null }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}>
          <Bitcoin size={16} style={{ color: "#fb923c" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Complete Crypto Payment</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Your payment link is waiting</p>
        </div>
      </div>
      {paymentRef ? (
        <a href={`https://nowpayments.io/payment/?iid=${paymentRef}`} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)" }}>
          <ExternalLink size={14} /> Continue to Payment
        </a>
      ) : (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          Payment link expired. Please create a new order or contact support.
        </p>
      )}
    </div>
  );
}

// ── Binance Gift Card ─────────────────────────────────────────────────────────
function GiftCardSection({ orderId, amount: _amount, denomination }: { orderId: string; amount: number; denomination: number }) {
  const [step, setStep] = useState<"instructions" | "code" | "submitted">("instructions");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const denomStr = denomination % 1 === 0 ? String(denomination) : denomination.toFixed(1).replace(".", "-");
  const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/checkout/binance-gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, giftCardCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit"); return; }
      setStep("submitted");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "submitted") {
    return (
      <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)" }}>
            <Check size={16} style={{ color: "#34d399" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Code Submitted — Pending Approval</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Our team is verifying your gift card</p>
          </div>
        </div>
        <div className="rounded-xl p-3 text-xs space-y-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>✓ Gift card code received by our team</p>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>⏳ Staff will verify and approve within minutes</p>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>📧 You&apos;ll receive your product via email once approved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(240,185,11,0.04)", border: "1px solid rgba(240,185,11,0.15)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(240,185,11,0.1)", border: "1px solid rgba(240,185,11,0.2)" }}>
          <CreditCard size={16} style={{ color: "#f0b90b" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Pay with Binance Gift Card</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>${denomination} USD card required</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
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

      {step === "instructions" && (
        <div className="space-y-4">
          <ol className="space-y-3">
            {[
              { n: 1, text: `Click the button below to open Eneba and purchase a $${denomination} USD Binance Gift Card.` },
              { n: 2, text: "Complete the purchase on Eneba. You'll receive a gift card code (e.g. XXXX-XXXX-XXXX-XXXX)." },
              { n: 3, text: "Come back to this invoice and click \"I have my code\" to enter it." },
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
            ⚠️ Purchase exactly a <strong>${denomination} USD</strong> Binance Gift Card. Other amounts won&apos;t be accepted.
          </div>
          <a href={enebaUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#f0b90b", color: "#000" }}>
            <ExternalLink size={15} /> Buy ${denomination} USD Gift Card on Eneba
          </a>
          <button onClick={() => setStep("code")}
            className="w-full py-2.5 rounded-xl text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
            I already have my code →
          </button>
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
  );
}

// ── Discord Manual ────────────────────────────────────────────────────────────
function DiscordSection({ orderId, amount }: { orderId: string; amount: number }) {
  const [copied, setCopied] = useState(false);
  // Discord message uses the display ID so staff can reference it easily
  const displayId = formatOrderId(orderId);
  const msg = `Hi! I want to complete my order. Reference: ${displayId} — Amount: $${amount.toFixed(2)}`;

  function copy() {
    // Copy the display ID (VLX-XXXXXX) — easier for customers to share
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(88,101,242,0.05)", border: "1px solid rgba(88,101,242,0.2)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(88,101,242,0.12)", border: "1px solid rgba(88,101,242,0.25)" }}>
          <MessageCircle size={16} style={{ color: "#818cf8" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Complete via Discord</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Manual payment — join our server to pay</p>
        </div>
      </div>
      <ol className="space-y-2 mb-4">
        {["Join our Discord server using the button below.", "Send a message with your Order Reference to our support team.", "Complete the payment as instructed by staff.", "Your product will be delivered once payment is confirmed."].map((t, i) => (
          <li key={i} className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ background: "rgba(88,101,242,0.15)", color: "#818cf8" }}>{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <code className="text-sm font-mono flex-1 text-purple-300 font-bold">{displayId}</code>
        <button onClick={copy} className="shrink-0 transition-colors" style={{ color: copied ? "#34d399" : "rgba(255,255,255,0.4)" }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <a href={`${DISCORD_URL}?message=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #5865f2, #7289da)" }}>
        <ExternalLink size={14} /> Join Discord to Pay
      </a>
    </div>
  );
}

// ── Balance ───────────────────────────────────────────────────────────────────
function BalanceSection() {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3">
        <Wallet size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          This order was placed with wallet balance. If it&apos;s still pending, please contact support.
        </p>
      </div>
    </div>
  );
}

// ── Support ───────────────────────────────────────────────────────────────────
function SupportSection({ orderId }: { orderId: string }) {
  const displayId = formatOrderId(orderId);
  const msg = `Hi, I need help with my order. Reference: ${displayId}`;
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-xs font-semibold text-white mb-1">Need help with this order?</p>
      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
        Our support team is available on Discord. Share your reference <span className="font-mono text-purple-300">{displayId}</span> and we&apos;ll sort it out.
      </p>
      <a href={`${DISCORD_URL}?message=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
        style={{ background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.2)" }}>
        <MessageCircle size={14} style={{ color: "#818cf8" }} /> Get Support on Discord
      </a>
    </div>
  );
}
