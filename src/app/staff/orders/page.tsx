"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  amount: number;
  discountAmount: number;
  status: string;
  paymentProvider: string;
  createdAt: string;
  guestEmail?: string | null;
  user?: { email: string; name?: string | null } | null;
  product: { title: string };
  deliveryLog?: { id: string } | null;
}

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet", binance_gift_card: "Gift Card", discord: "Discord",
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [redelivering, setRedelivering] = useState<string | null>(null);
  const [redeliverStatus, setRedeliverStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/staff/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleRedeliver(orderId: string) {
    setRedelivering(orderId);
    try {
      const res = await fetch("/api/staff/orders/redeliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      setRedeliverStatus((prev) => ({
        ...prev,
        [orderId]: res.ok ? "✅ Sent" : `❌ ${data.error}`,
      }));
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, deliveryLog: { id: "done" } } : o)
        );
      }
    } finally {
      setRedelivering(null);
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.user?.email ?? o.guestEmail ?? "").toLowerCase().includes(q) ||
      o.product.title.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <ShoppingCart size={22} className="text-purple-400" /> Orders
        <span className="text-sm font-normal text-gray-500 ml-2">({orders.length})</span>
      </h1>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, email, or product…"
          className="input-field pl-9 w-full max-w-md"
        />
      </div>

      <div className="glass-card overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-600 py-12">Loading…</p>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">
                    <a href={`/staff/orders/${o.id}`} className="hover:text-purple-300 transition-colors">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-[160px]">
                    {o.user?.email ?? o.guestEmail ?? "Guest"}
                  </td>
                  <td className="px-4 py-3 text-white text-xs truncate max-w-[160px]">{o.product.title}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">${Number(o.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {redeliverStatus[o.id] ? (
                      <span className="text-xs text-green-400">{redeliverStatus[o.id]}</span>
                    ) : o.status === "PAID" && !o.deliveryLog ? (
                      <button
                        onClick={() => handleRedeliver(o.id)}
                        disabled={redelivering === o.id}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw size={12} className={redelivering === o.id ? "animate-spin" : ""} />
                        Re-deliver
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-600 py-12">No orders found.</p>
        )}
      </div>
    </div>
  );
}
