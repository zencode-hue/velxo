"use client";

import { useState } from "react";
import {
  Handshake, Copy, Check, ExternalLink, Wallet, ArrowDownToLine,
  Clock, TrendingUp, DollarSign, Users, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";

interface PayoutRequest {
  id: string; amount: number; status: string; createdAt: string;
  txHash?: string | null; walletType: string; cryptoWallet: string; adminNote?: string | null;
}

interface PartnerData {
  id: string; referralCode: string; referralLink: string; commissionPct: number;
  balance: number; totalEarned: number; totalPaidOut: number; totalReferrals: number;
  cryptoWallet: string | null; walletType: string | null; status: string;
  payoutRequests: PayoutRequest[];
}

const WALLET_TYPES = ["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "BNB"];
const MIN_PAYOUT = 10;

const PAYOUT_ICON: Record<string, React.ElementType> = {
  PENDING: Clock, APPROVED: CheckCircle2, REJECTED: XCircle,
};
const PAYOUT_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400", APPROVED: "text-green-400", REJECTED: "text-red-400",
};

export default function PartnerDashboard({ partner: initial }: { partner: PartnerData | null }) {
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
  const [activeTab, setActiveTab] = useState<"overview" | "payouts">("overview");

  function copyLink() {
    if (!partner) return;
    navigator.clipboard.writeText(partner.referralLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function applyPartner() {
    setApplyError(""); setApplyLoading(true);
    try {
      const res = await fetch("/api/v1/partner/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();
      if (!res.ok) { setApplyError(data.error ?? "Failed"); return; }
      window.location.reload();
    } finally { setApplyLoading(false); }
  }

  async function saveWallet() {
    setWalletLoading(true); setWalletMsg("");
    try {
      const res = await fetch("/api/v1/partner/wallet", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPartner((prev) => prev ? { ...prev, cryptoWallet: walletForm.cryptoWallet, walletType: walletForm.walletType } : prev);
        setEditingWallet(false);
      } else { setWalletMsg(data.error ?? "Failed"); }
    } finally { setWalletLoading(false); }
  }

  async function requestPayout() {
    setPayoutMsg(null);
    const amount = Number(payoutAmount);
    if (!amount || amount < MIN_PAYOUT) { setPayoutMsg({ type: "error", msg: `Minimum payout is $${MIN_PAYOUT}` }); return; }
    setPayoutLoading(true);
    try {
      const res = await fetch("/api/v1/partner/payout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMsg({ type: "success", msg: "Payout request submitted. Admin will process it shortly." });
        setPayoutAmount("");
        window.location.reload();
      } else { setPayoutMsg({ type: "error", msg: data.error ?? "Failed" }); }
    } finally { setPayoutLoading(false); }
  }

  // ── Not applied ──────────────────────────────────────────────────────────────
  if (!partner) {
    if (!applying) {
      return (
        <div className="space-y-6">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Handshake size={28} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Join the Partner Program</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              Earn real cash commissions on every sale you refer. Get paid directly to your crypto wallet with no minimum threshold beyond $10.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              {[["15%", "Commission"], ["$10", "Min Payout"], ["Crypto", "Payout Method"]].map(([v, l]) => (
                <div key={l} className="p-3 rounded-xl bg-white/3 text-center">
                  <div className="text-lg font-bold text-green-400">{v}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setApplying(true)} className="btn-primary px-8 py-3">
              Apply Now — It&apos;s Free
            </button>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">How it works</h3>
            <div className="space-y-3">
              {[
                ["1", "Apply with your crypto wallet address"],
                ["2", "Get approved by our team (usually within 24h)"],
                ["3", "Share your unique partner referral link"],
                ["4", "Earn commission on every referred purchase"],
                ["5", "Request payout anytime — sent to your wallet"],
              ].map(([n, t]) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center shrink-0">{n}</div>
                  <p className="text-sm text-gray-400">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-6 max-w-md">
        <h2 className="text-lg font-bold text-white mb-1">Partner Application</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your crypto wallet. Your application will be reviewed within 24 hours.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Wallet Type</label>
            <select value={applyForm.walletType} onChange={(e) => setApplyForm({ ...applyForm, walletType: e.target.value })} className="input-field w-full">
              {WALLET_TYPES.map((w) => <option key={w} value={w}>{w.replace(/_/g, " ")}</option>)}
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

  // ── Pending ──────────────────────────────────────────────────────────────────
  if (partner.status === "PENDING") {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-yellow-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Application Under Review</h2>
        <p className="text-gray-400 text-sm">Your partner application is being reviewed. We&apos;ll activate your account within 24 hours.</p>
      </div>
    );
  }

  // ── Active ───────────────────────────────────────────────────────────────────
  const pendingPayout = partner.payoutRequests.find((p) => p.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: partner.totalReferrals, icon: Users, color: "text-white", bg: "bg-white/5" },
          { label: "Total Earned", value: `$${partner.totalEarned.toFixed(2)}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Available", value: `$${partner.balance.toFixed(2)}`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Paid Out", value: `$${partner.totalPaidOut.toFixed(2)}`, icon: CheckCircle2, color: "text-gray-400", bg: "bg-white/5" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Your Partner Link</h3>
          <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
            {partner.commissionPct}% commission
          </span>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-green-600/20 flex items-center justify-between gap-3">
          <code className="text-sm text-green-300 break-all flex-1">{partner.referralLink}</code>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={copyLink} className="text-gray-500 hover:text-green-400 transition-colors">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            <a href={partner.referralLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {(["overview", "payouts"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-[#ea580c] text-white" : "text-gray-400 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet size={15} className="text-gray-400" /> Payout Wallet
          </h3>
          {editingWallet ? (
            <div className="space-y-3 max-w-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select value={walletForm.walletType} onChange={(e) => setWalletForm({ ...walletForm, walletType: e.target.value })} className="input-field w-full text-sm">
                    {WALLET_TYPES.map((w) => <option key={w} value={w}>{w.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Address</label>
                  <input value={walletForm.cryptoWallet} onChange={(e) => setWalletForm({ ...walletForm, cryptoWallet: e.target.value })}
                    className="input-field w-full font-mono text-xs" placeholder="Wallet address" />
                </div>
              </div>
              {walletMsg && <p className="text-red-400 text-xs">{walletMsg}</p>}
              <div className="flex gap-2">
                <button onClick={saveWallet} disabled={walletLoading} className="btn-primary text-sm px-5 py-2">{walletLoading ? "Saving…" : "Save"}</button>
                <button onClick={() => setEditingWallet(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex-1 mr-4">
                {partner.cryptoWallet ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-purple-400 font-medium shrink-0">{partner.walletType?.replace(/_/g, " ")}</span>
                    <code className="text-xs text-gray-300 font-mono break-all">{partner.cryptoWallet}</code>
                  </div>
                ) : <p className="text-xs text-gray-600">No wallet set.</p>}
              </div>
              <button onClick={() => { setEditingWallet(true); setWalletForm({ cryptoWallet: partner.cryptoWallet ?? "", walletType: partner.walletType ?? "USDT_TRC20" }); }}
                className="text-xs text-gray-500 hover:text-white transition-colors shrink-0">Edit</button>
            </div>
          )}

          {/* Payout request */}
          {partner.balance >= MIN_PAYOUT && partner.cryptoWallet && !pendingPayout && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ArrowDownToLine size={14} className="text-yellow-400" /> Request Payout
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                    min={MIN_PAYOUT} max={partner.balance} step="0.01"
                    className="input-field pl-7 w-36 text-sm" placeholder={`Min $${MIN_PAYOUT}`} />
                </div>
                <button onClick={requestPayout} disabled={payoutLoading} className="btn-primary text-sm px-5 py-2.5">
                  {payoutLoading ? "Requesting…" : "Request Payout"}
                </button>
                <span className="text-xs text-gray-500">Available: <span className="text-yellow-400">${partner.balance.toFixed(2)}</span></span>
              </div>
              {payoutMsg && (
                <p className={`text-xs mt-2 ${payoutMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>{payoutMsg.msg}</p>
              )}
            </div>
          )}

          {pendingPayout && (
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-2">
              <AlertCircle size={14} className="text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-400">You have a pending payout of <strong>${pendingPayout.amount.toFixed(2)}</strong> being processed.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="glass-card">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Payout History</h3>
          </div>
          {partner.payoutRequests.length === 0 ? (
            <p className="text-center text-gray-600 py-10 text-sm">No payout requests yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {partner.payoutRequests.map((p) => {
                const Icon = PAYOUT_ICON[p.status] ?? Clock;
                return (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={PAYOUT_COLOR[p.status] ?? "text-gray-400"} />
                        <div>
                          <p className="text-sm font-bold text-white">${p.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{p.walletType.replace(/_/g, " ")} · {new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${PAYOUT_COLOR[p.status] ?? "text-gray-400"}`}>{p.status}</span>
                    </div>
                    {p.txHash && (
                      <p className="text-xs text-gray-600 font-mono mt-1.5 truncate">TX: {p.txHash}</p>
                    )}
                    {p.adminNote && (
                      <p className="text-xs text-gray-500 mt-1">Note: {p.adminNote}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
