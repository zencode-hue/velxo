"use client";

import { useState } from "react";
import { Wallet, Bitcoin, MessageCircle, Plus, X, ExternalLink, CreditCard } from "lucide-react";

export default function BalanceSection({ balance }: { balance: number }) {
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const PRESETS = [5, 10, 25, 50, 100];

  async function handleTopup(provider: "nowpayments" | "discord" | "binance_gift_card" | "flutterwave") {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { setErr("Minimum top-up is $1"); return; }
    setLoading(true); setErr(null);
    const res = await fetch("/api/v1/balance/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, paymentProvider: provider }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error); return; }
    if (provider === "binance_gift_card" && data.data?.codeSubmitUrl) {
      window.open(data.data.redirectUrl, "_blank");
      window.location.href = data.data.codeSubmitUrl;
      return;
    }
    if (data.data?.redirectUrl) window.location.href = data.data.redirectUrl;
  }

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet size={18} className="text-cyan-400" /> Wallet Balance
        </h2>
        <button onClick={() => setShowTopup(!showTopup)} className="btn-primary text-sm px-4 py-2 gap-1.5">
          <Plus size={14} /> Top Up
        </button>
      </div>

      <div className="text-3xl font-bold text-cyan-400 mb-1">${balance.toFixed(2)}</div>
      <p className="text-xs text-gray-500">Use your balance to purchase any product instantly — no payment redirect needed.</p>

      {showTopup && (
        <div className="mt-5 p-4 rounded-xl bg-white/3 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Top Up Amount</p>
            <button onClick={() => setShowTopup(false)}><X size={14} className="text-gray-500" /></button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(String(p))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${amount === String(p) ? "bg-purple-600 text-white" : "glass-card text-gray-400 hover:text-white"}`}>
                ${p}
              </button>
            ))}
            <input type="number" min="1" max="500" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="input-field text-sm py-1.5 w-24" placeholder="Custom" />
          </div>

          {err && <p className="text-red-400 text-xs">{err}</p>}

          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleTopup("flutterwave")} disabled={loading}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-green-500/40 hover:bg-green-500/5 transition-all text-left">
              <CreditCard size={18} className="text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Card Payment</p>
                <p className="text-xs text-gray-500">Visa, Mastercard via Flutterwave</p>
              </div>
            </button>
            <button onClick={() => handleTopup("binance_gift_card")} disabled={loading}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-left">
              <ExternalLink size={18} className="text-yellow-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Card Payment (Key)</p>
                <p className="text-xs text-gray-500">Buy a Binance gift card on Eneba</p>
              </div>
            </button>
            <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleTopup("nowpayments")} disabled={loading}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all text-left">
              <Bitcoin size={18} className="text-orange-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Crypto</p>
                <p className="text-xs text-gray-500">BTC, ETH, USDT+</p>
              </div>
            </button>
            <button onClick={() => handleTopup("discord")} disabled={loading}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left">
              <MessageCircle size={18} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Discord</p>
                <p className="text-xs text-gray-500">Manual payment</p>
              </div>
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
