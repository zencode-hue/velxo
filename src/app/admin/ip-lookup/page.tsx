"use client";

import { useState } from "react";
import { Search, Loader2, Globe, Monitor, Clock, MapPin, Link2, ShoppingCart } from "lucide-react";

interface PageView {
  path: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  referrer: string | null;
  userAgent: string | null;
  sessionId: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  paymentProvider: string;
  createdAt: string;
  productTitle: string;
  email: string;
}

interface Result {
  ip: string;
  totalVisits: number;
  uniqueSessions: number;
  firstSeen: string;
  lastSeen: string;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  userAgent: string | null;
  views: PageView[];
  orders: Order[];
  matchedUsers: { id: string; email: string; name: string | null }[];
}

export default function IpLookupPage() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    const trimmed = ip.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/admin/ip-lookup?ip=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lookup failed"); return; }
      setResult(data.data);
    } catch (e) {
      setError("Request failed: " + String(e));
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  const STATUS_COLOR: Record<string, string> = {
    PAID: "text-green-400", PENDING: "text-yellow-400", FAILED: "text-red-400",
    PENDING_STOCK: "text-orange-400", REFUNDED: "text-purple-400",
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Search size={22} className="text-purple-400" /> IP Lookup
      </h1>
      <p className="text-gray-500 text-sm mb-8">Enter an IP address to see all visit history, device info, and any linked orders.</p>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="e.g. 192.168.1.1 or 2a02:3032:..."
          className="input-field flex-1 font-mono text-sm py-3"
        />
        <button onClick={lookup} disabled={loading || !ip.trim()}
          className="btn-primary px-6 py-3 flex items-center gap-2 shrink-0">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Lookup
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Visits", value: result.totalVisits, color: "text-purple-400" },
              { label: "Unique Sessions", value: result.uniqueSessions, color: "text-blue-400" },
              { label: "First Seen", value: timeAgo(result.firstSeen), color: "text-gray-400" },
              { label: "Last Seen", value: timeAgo(result.lastSeen), color: "text-green-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Device info */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor size={14} className="text-blue-400" /> Device Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {[
                { label: "IP", value: result.ip },
                { label: "Country", value: result.country ?? "—" },
                { label: "City", value: result.city ?? "—" },
                { label: "Browser", value: result.browser ?? "—" },
                { label: "OS", value: result.os ?? "—" },
                { label: "Device", value: result.device ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-gray-300 font-mono text-xs mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {result.userAgent && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500 mb-1">User Agent</p>
                <p className="text-gray-500 text-xs break-all">{result.userAgent}</p>
              </div>
            )}
          </div>

          {/* Matched users */}
          {result.matchedUsers.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={14} className="text-green-400" /> Linked Accounts ({result.matchedUsers.length})
              </h2>
              <div className="space-y-2">
                {result.matchedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white">{u.email}</span>
                      {u.name && <span className="text-gray-500 ml-2 text-xs">{u.name}</span>}
                    </div>
                    <a href={`/admin/customers/${u.id}`}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      View Customer →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders from this IP */}
          {result.orders.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShoppingCart size={14} className="text-purple-400" /> Orders ({result.orders.length})
                </h2>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 uppercase">
                    <th className="text-left px-5 py-3">Invoice</th>
                    <th className="text-left px-5 py-3">Product</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-right px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {result.orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-5 py-2.5 font-mono text-purple-400">VLX-{o.id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-2.5 text-white truncate max-w-[140px]">{o.productTitle}</td>
                      <td className="px-5 py-2.5 text-gray-400">{o.email}</td>
                      <td className="px-5 py-2.5 text-right text-white">${o.amount.toFixed(2)}</td>
                      <td className={`px-5 py-2.5 font-medium ${STATUS_COLOR[o.status] ?? "text-gray-400"}`}>{o.status}</td>
                      <td className="px-5 py-2.5 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Visit history */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock size={14} className="text-accent" /> Visit History ({result.views.length})
              </h2>
            </div>
            <table className="w-full text-xs min-w-[600px] overflow-x-auto">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase">
                  <th className="text-left px-5 py-3">Path</th>
                  <th className="text-left px-5 py-3">Source</th>
                  <th className="text-left px-5 py-3">Session</th>
                  <th className="text-left px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {result.views.map((v, i) => {
                  const referrerHost = v.referrer
                    ? (() => { try { return new URL(v.referrer).hostname.replace("www.", ""); } catch { return v.referrer.slice(0, 30); } })()
                    : "direct";
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-5 py-2.5 font-mono text-accent">{v.path}</td>
                      <td className={`px-5 py-2.5 ${referrerHost === "direct" ? "text-gray-600" : "text-blue-400"}`}>{referrerHost}</td>
                      <td className="px-5 py-2.5 font-mono text-gray-700">{v.sessionId?.slice(0, 8) ?? "—"}</td>
                      <td className="px-5 py-2.5 text-gray-500" title={new Date(v.createdAt).toLocaleString()}>
                        {timeAgo(v.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {result.views.length === 0 && (
              <p className="text-center text-gray-600 py-8">No page views recorded for this IP.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
