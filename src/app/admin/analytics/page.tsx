import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { BarChart2, Globe, Monitor, Smartphone, Chrome, MapPin, Link2, Eye, Users, TrendingUp, DollarSign, ShoppingCart, CreditCard, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  nowpayments: "Crypto (NOWPayments)",
  balance: "Wallet Balance",
  binance_gift_card: "Binance Gift Card",
  discord: "Discord Manual",
};

const PAYMENT_COLORS: Record<string, string> = {
  nowpayments: "text-orange-400",
  balance: "text-cyan-400",
  binance_gift_card: "text-yellow-400",
  discord: "text-indigo-400",
};

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  const [
    views24h, views7d, views30d,
    uniqueSessions30d,
    topPages, topCountries, topReferrers,
    byDevice, byBrowser, byOS,
    recentViews,
    revenueToday, revenueWeek, revenueMonth, revenueTotal,
    ordersToday, ordersWeek, ordersMonth,
    paymentMethodBreakdown,
    topProducts,
  ] = await Promise.all([
    pv.count({ where: { createdAt: { gte: last24h } } }),
    pv.count({ where: { createdAt: { gte: last7 } } }),
    pv.count({ where: { createdAt: { gte: last30 } } }),
    pv.groupBy({ by: ["ip"], where: { createdAt: { gte: last30 }, ip: { not: null } }, _count: true }).then((r: unknown[]) => r.length),
    pv.groupBy({ by: ["path"], where: { createdAt: { gte: last30 } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["country"], where: { createdAt: { gte: last30 }, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["referrer"], where: { createdAt: { gte: last30 }, referrer: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["device"], where: { createdAt: { gte: last30 }, device: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    pv.groupBy({ by: ["browser"], where: { createdAt: { gte: last30 }, browser: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 6 }),
    pv.groupBy({ by: ["os"], where: { createdAt: { gte: last30 }, os: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 6 }),
    pv.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { path: true, country: true, device: true, browser: true, referrer: true, ip: true, createdAt: true } }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    db.order.groupBy({ by: ["paymentProvider"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } } }),
    db.order.groupBy({ by: ["productId"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
  ]);

  const productIds = (topProducts as { productId: string }[]).map((p) => p.productId);
  const productTitles = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, title: true } });
  const titleMap = Object.fromEntries(productTitles.map((p) => [p.id, p.title]));

  const totalPaymentOrders = (paymentMethodBreakdown as { _count: { id: number } }[]).reduce((s, p) => s + p._count.id, 0);

  type GroupRow = { _count: { id: number } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart2 size={22} className="text-accent" /> Analytics
      </h1>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", revenue: Number(revenueToday._sum.amount ?? 0), orders: ordersToday, color: "text-green-400" },
          { label: "This Week", revenue: Number(revenueWeek._sum.amount ?? 0), orders: ordersWeek, color: "text-blue-400" },
          { label: "This Month", revenue: Number(revenueMonth._sum.amount ?? 0), orders: ordersMonth, color: "text-purple-400" },
          { label: "All Time", revenue: Number(revenueTotal._sum.amount ?? 0), orders: revenueTotal._count, color: "text-yellow-400" },
        ].map(({ label, revenue, orders, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
              <DollarSign size={12} className={color} /> {label}
            </div>
            <div className={`text-xl font-bold ${color}`}>${revenue.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <ShoppingCart size={10} /> {orders} orders
            </div>
          </div>
        ))}
      </div>

      {/* Page view stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Last 24h", value: views24h, icon: Eye, color: "text-neon" },
          { label: "Last 7 days", value: views7d, icon: TrendingUp, color: "text-accent" },
          { label: "Last 30 days", value: views30d, icon: BarChart2, color: "text-purple-400" },
          { label: "Unique Visitors (30d)", value: uniqueSessions30d, icon: Users, color: "text-discord-green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Icon size={14} className={color} /> {label}
            </div>
            <div className={`text-2xl font-bold ${color}`}>{(value as number).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment method breakdown */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-yellow-400" /> Payment Methods (All Time)
          </h2>
          <div className="space-y-3">
            {(paymentMethodBreakdown as { paymentProvider: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p) => {
              const pct = totalPaymentOrders > 0 ? Math.round((p._count.id / totalPaymentOrders) * 100) : 0;
              const color = PAYMENT_COLORS[p.paymentProvider] ?? "text-gray-400";
              return (
                <div key={p.paymentProvider}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`font-medium ${color}`}>{PAYMENT_LABELS[p.paymentProvider] ?? p.paymentProvider}</span>
                    <span className="text-gray-400">{p._count.id} orders · ${Number(p._sum.amount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{pct}%</div>
                </div>
              );
            })}
            {(paymentMethodBreakdown as unknown[]).length === 0 && <p className="text-gray-600 text-xs">No paid orders yet</p>}
          </div>
        </div>

        {/* Top selling products */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={14} className="text-purple-400" /> Top Products (All Time)
          </h2>
          <div className="space-y-2">
            {(topProducts as { productId: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-600 w-4 shrink-0">#{i + 1}</span>
                  <span className="text-gray-300 truncate">{titleMap[p.productId] ?? "Unknown"}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-white font-medium">${Number(p._sum.amount ?? 0).toFixed(2)}</span>
                  <span className="text-gray-600 text-xs ml-1">({p._count.id})</span>
                </div>
              </div>
            ))}
            {(topProducts as unknown[]).length === 0 && <p className="text-gray-600 text-xs">No sales yet</p>}
          </div>
        </div>

        {/* Top pages */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye size={14} className="text-accent" /> Top Pages (30d)
          </h2>
          <div className="space-y-2">
            {(topPages as ({ path: string } & GroupRow)[]).map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate max-w-[200px] font-mono text-xs">{p.path}</span>
                <span className="text-accent font-medium ml-2">{p._count.id.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top countries */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={14} className="text-neon" /> Top Countries (30d)
          </h2>
          <div className="space-y-2">
            {(topCountries as ({ country: string } & GroupRow)[]).map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{c.country ?? "Unknown"}</span>
                <span className="text-neon font-medium">{c._count.id.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top referrers */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 size={14} className="text-purple-400" /> Top Referrers (30d)
          </h2>
          <div className="space-y-2">
            {(topReferrers as ({ referrer: string } & GroupRow)[]).length === 0 && (
              <p className="text-gray-600 text-xs">No referrer data yet</p>
            )}
            {(topReferrers as ({ referrer: string } & GroupRow)[]).map((r) => (
              <div key={r.referrer} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate max-w-[200px] text-xs">{r.referrer}</span>
                <span className="text-purple-400 font-medium ml-2">{r._count.id.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device / Browser / OS */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Monitor size={14} className="text-yellow-400" /> Devices & Browsers (30d)
          </h2>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Smartphone size={11} /> Device</p>
            <div className="flex gap-3 flex-wrap">
              {(byDevice as ({ device: string } & GroupRow)[]).map((d) => (
                <span key={d.device} className="badge-purple text-xs">{d.device}: {d._count.id}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Chrome size={11} /> Browser</p>
            <div className="flex gap-2 flex-wrap">
              {(byBrowser as ({ browser: string } & GroupRow)[]).map((b) => (
                <span key={b.browser} className="badge-blue text-xs">{b.browser}: {b._count.id}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Monitor size={11} /> OS</p>
            <div className="flex gap-2 flex-wrap">
              {(byOS as ({ os: string } & GroupRow)[]).map((o) => (
                <span key={o.os} className="badge-yellow text-xs">{o.os}: {o._count.id}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent visits */}
      <div className="glass-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin size={14} className="text-accent" /> Recent Visits
          </h2>
        </div>
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 uppercase">
              <th className="text-left px-5 py-3">Path</th>
              <th className="text-left px-5 py-3">Country</th>
              <th className="text-left px-5 py-3">Device</th>
              <th className="text-left px-5 py-3">Browser</th>
              <th className="text-left px-5 py-3">Referrer</th>
              <th className="text-left px-5 py-3">IP</th>
              <th className="text-left px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {(recentViews as { path: string; country: string | null; device: string | null; browser: string | null; referrer: string | null; ip: string | null; createdAt: Date }[]).map((v, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-5 py-2.5 font-mono text-accent">{v.path}</td>
                <td className="px-5 py-2.5 text-gray-300">{v.country ?? "—"}</td>
                <td className="px-5 py-2.5 text-gray-400">{v.device ?? "—"}</td>
                <td className="px-5 py-2.5 text-gray-400">{v.browser ?? "—"}</td>
                <td className="px-5 py-2.5 text-gray-500 truncate max-w-[120px]">{v.referrer ? (() => { try { return new URL(v.referrer).hostname; } catch { return v.referrer; } })() : "direct"}</td>
                <td className="px-5 py-2.5 font-mono text-gray-600">{v.ip ?? "—"}</td>
                <td className="px-5 py-2.5 text-gray-600">{new Date(v.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
