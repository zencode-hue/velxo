"use client";

import { useState } from "react";
import { Handshake, Copy, Check, ExternalLink, Wallet, ArrowDownToLine, Clock } from "lucide-react";

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  txHash?: string | null;
  walletType: string;
}

interface PartnerData {
  id: string;
  referralCode: string;
  referralLink: string;
  commissionPct: number;
  balance: number;
  totalEarned: number;
  totalPaidOut: number;
  totalReferrals: number;
  cryptoWallet: string | null;
  walletType: string | null;
  status: string;
  payoutRequests: PayoutRequest[];
}

const WALLET_TYPES = ["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "BNB"];
const MIN_PAYOUT = 10;

const PAYOUT_BADGE: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  APPROVED: "text-green-400 bg-green-400/10 border-green-400/20",
  REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function PartnerSection({ partner: initial }: { partner: PartnerData | null }) {
  const [partner, setPartner] = useState<PartnerData | null>(initial);
  const [applying, setApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ cryptoWallet: "", walletType: "USDT_TRC20" });
  const [applyError, setApplyError] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  const [editingWallet, setEditingWallet] = useState(false);
  const [walletForm, setWalletForm] = useState({ cryptoWallet: initial?.cryptoWallet ?? "", walletType: initial?.walletType ?? "USDT_TRC20" });
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState("");

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!partner) return;
    navigator.clipboard.writeText(partner.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function applyPartner() {
    setApplyError("");
    setApplyLoading(true);
    try {
      const res = await fetch("/api/v1/partner/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();
      if (!res.ok) { setApplyError(data.error ?? "Failed"); return; }
      window.location.reload();
    } finally {
      setApplyLoading(false);
    }
  }

  async function saveWallet() {
    setWalletLoading(true);
    setWalletMsg("");
    try {
      const res = await fetch("/api/v1/partner/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPartner((prev) => prev ? { ...prev, cryptoWallet: walletForm.cryptoWallet, walletType: walletForm.walletType } : prev);
        setEditingWallet(false);
        setWalletMsg("Wallet updated");
      } else {
        setWalletMsg(data.error ?? "Failed");
      }
    } finally {
      setWalletLoading(false);
    }
  }

  async function requestPayout() {
    setPayoutMsg(null);
    const amount = Number(payoutAmount);
    if (!amount || amount < MIN_PAYOUT) {
      setPayoutMsg({ type: "error", msg: `Minimum payout is $${MIN_PAYOUT}` });
      return;
    }
    setPayoutLoading(true);
    try {
      const res = await fetch("/api/v1/partner/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMsg({ type: "success", msg: "Payout request submitted. Admin will process it shortly." });
        setPayoutAmount("");
        window.location.reload();
      } else {
        setPayoutMsg({ type: "error", msg: data.error ?? "Failed" });
      }
    } finally {
      setPayoutLoading(false);
    }
  }

  // Not applied yet
  if (!partner) {
    if (!applying) {
      return (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Handshake size={18} className="text-green-400" /> Partner Program
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Earn real cash commissions on every referred sale. Add your crypto wallet and request payouts anytime.
              </p>
            </div>
            <button onClick={() => setApplying(true)} className="btn-primary text-sm px-6 py-2.5">
              Apply to Partner Program
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Handshake size={18} className="text-green-400" /> Partner Application
        </h2>
        <p className="text-sm text-gray-500 mb-5">Enter your crypto wallet to receive payouts. Your application will be reviewed by our team.</p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Wallet Type</label>
            <select value={applyForm.walletType} onChange={(e) => setApplyForm({ ...applyForm, walletType: e.target.value })}
              className="input-field w-full">
              {WALLET_TYPES.map((w) => <option key={w} value={w}>{w.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Wallet Address</label>
            <input value={applyForm.cryptoWallet} onChange={(e) => setApplyForm({ ...applyForm, cryptoWallet: e.target.value })}
              className="input-field w-full font-mono text-sm" placeholder="Your wallet address" />
          </div>
          {applyError && <p className="text-red-400 text-xs">{applyError}</p>}
          <div className="flex gap-3">
            <button onClick={applyPartner} disabled={applyLoading} className="btn-primary text-sm px-6 py-2.5">
              {applyLoading ? "Submitting…" : "Submit Application"}
            </button>
            <button onClick={() => setApplying(false)} className="btn-secondary text-sm px-4 py-2.5">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // Pending approval
  if (partner.status === "PENDING") {
    return (
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-yellow-400" />
          <div>
            <h2 className="text-base font-bold text-white">Partner Application Pending</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your application is under review. We&apos;ll activate your account shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active partner
  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <Handshake size={18} className="text-green-400" /> Partner Dashboard
        <span className="ml-auto text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
          {partner.commissionPct}% commission
        </span>
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Referrals", value: partner.totalReferrals, color: "text-white" },
          { label: "Total Earned", value: `$${partner.totalEarned.toFixed(2)}`, color: "text-green-400" },
          { label: "Available Balance", value: `$${partner.balance.toFixed(2)}`, color: "text-yellow-400" },
          { label: "Paid Out", value: `$${partner.totalPaidOut.toFixed(2)}`, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-white/3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="p-3 bg-black/40 rounded-xl border border-green-600/20 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Your partner referral link</span>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="text-gray-500 hover:text-green-400 transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <a href={partner.referralLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <code className="text-sm text-green-300 break-all">{partner.referralLink}</code>
      </div>

      {/* Wallet */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Wallet size={14} className="text-gray-400" /> Payout Wallet</h3>
          <button onClick={() => { setEditingWallet(!editingWallet); setWalletForm({ cryptoWallet: partner.cryptoWallet ?? "", walletType: partner.walletType ?? "USDT_TRC20" }); }}
            className="text-xs text-gray-500 hover:text-white transition-colors">
            {editingWallet ? "Cancel" : "Edit"}
          </button>
        </div>
        {editingWallet ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Wallet Type</label>
                <select value={walletForm.walletType} onChange={(e) => setWalletForm({ ...walletForm, walletType: e.target.value })}
                  className="input-field w-full text-sm">
                  {WALLET_TYPES.map((w) => <option key={w} value={w}>{w.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <input value={walletForm.cryptoWallet} onChange={(e) => setWalletForm({ ...walletForm, cryptoWallet: e.target.value })}
                  className="input-field w-full font-mono text-xs" placeholder="Wallet address" />
              </div>
            </div>
            {walletMsg && <p className="text-xs text-red-400">{walletMsg}</p>}
            <button onClick={saveWallet} disabled={walletLoading} className="btn-primary text-sm px-5 py-2">
              {walletLoading ? "Saving…" : "Save Wallet"}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-black/30 rounded-xl border border-white/5">
            {partner.cryptoWallet ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-purple-400 font-medium">{partner.walletType?.replace("_", " ")}</span>
                <code className="text-xs text-gray-300 font-mono break-all">{partner.cryptoWallet}</code>
              </div>
            ) : (
              <p className="text-xs text-gray-600">No wallet set. Add one to request payouts.</p>
            )}
          </div>
        )}
      </div>

      {/* Payout request */}
      {partner.balance >= MIN_PAYOUT && partner.cryptoWallet && (
        <div className="mb-5 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ArrowDownToLine size={14} className="text-yellow-400" /> Request Payout
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                min={MIN_PAYOUT} max={partner.balance} step="0.01"
                className="input-field pl-7 w-36 text-sm" placeholder={`Min $${MIN_PAYOUT}`} />
            </div>
            <button onClick={requestPayout} disabled={payoutLoading} className="btn-primary text-sm px-5 py-2.5">
              {payoutLoading ? "Requesting…" : "Request Payout"}
            </button>
            <span className="text-xs text-gray-500">Available: ${partner.balance.toFixed(2)}</span>
          </div>
          {payoutMsg && (
            <p className={`text-xs mt-2 ${payoutMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {payoutMsg.msg}
            </p>
          )}
        </div>
      )}

      {/* Payout history */}
      {partner.payoutRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Recent Payouts</h3>
          <div className="space-y-2">
            {partner.payoutRequests.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 text-sm">
                <div>
                  <span className="text-white font-medium">${p.amount.toFixed(2)}</span>
                  <span className="text-gray-500 text-xs ml-2">{p.walletType.replace("_", " ")}</span>
                  {p.txHash && <p className="text-xs text-gray-600 font-mono mt-0.5 truncate max-w-[200px]">TX: {p.txHash}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${PAYOUT_BADGE[p.status] ?? ""}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
