"use client";

import { useState } from "react";
import { Users, Copy, Check, ExternalLink } from "lucide-react";

interface AffiliateData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarned: number;
  pendingPayout: number;
  commissionPct: number;
}

export default function AffiliateSection({ affiliate }: { affiliate: AffiliateData | null }) {
  const [joining, setJoining] = useState(false);
  const [data, setData] = useState<AffiliateData | null>(affiliate);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function joinAffiliate() {
    setJoining(true); setErr(null);
    const res = await fetch("/api/v1/affiliate/join", { method: "POST" });
    const json = await res.json();
    setJoining(false);
    if (!res.ok) { setErr(json.error); return; }
    // Reload to get full data
    window.location.reload();
  }

  function copyLink() {
    if (!data) return;
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!data) {
    return (
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-amber-400" /> Affiliate Program
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Earn {process.env.NEXT_PUBLIC_AFFILIATE_PCT ?? "10"}% commission on every sale you refer. Get your unique metramart.xyz link instantly.
            </p>
          </div>
          <button onClick={joinAffiliate} disabled={joining} className="btn-primary text-sm px-6 py-2.5">
            {joining ? "Joining…" : "Join Affiliate Program"}
          </button>
        </div>
        {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Users size={18} className="text-amber-400" /> Affiliate Program
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center p-3 rounded-xl bg-white/3">
          <div className="text-xl font-bold text-white">{data.totalReferrals}</div>
          <div className="text-xs text-gray-500 mt-1">Referrals</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/3">
          <div className="text-xl font-bold text-green-400">${data.totalEarned.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Earned</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/3">
          <div className="text-xl font-bold text-yellow-400">${data.pendingPayout.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Pending</div>
        </div>
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-purple-600/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Your referral link ({data.commissionPct}% commission)</span>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="text-gray-500 hover:text-amber-400 transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <a href={data.referralLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-400 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <code className="text-sm text-purple-300 break-all">{data.referralLink}</code>
      </div>
    </div>
  );
}
