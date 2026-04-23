import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { BarChart2, Globe, Monitor, Smartphone, Eye, Users, TrendingUp, DollarSign, ShoppingCart, CreditCard, Package, ArrowUpRight, MapPin, Link2, Chrome } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet", binance_gift_card: "Gift Card", discord: "Discord",
};
const PAYMENT_COLORS: Record<string, string> = {
  nowpayments: "#fb923c", balance: "#22d3ee", binance_gift_card: "#fbbf24", discord: "#818cf8",
};

function StatCard({ label, value, sub, color, icon: Icon, trend }: {
  label: string; value: string | number; sub?: string; color: string;
  icon: React.ElementType; trend?: number;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Icon size={13} style={{ color }} /> {label}
        </div>
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            <ArrowUpRight size={11} style={{ transform: trend < 0 ? "rotate(90deg)" : undefined }} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  const [
    views24h, views7d, views30d,
    uniqueIPs30d,
    topPages, topCountries, topReferrers,
    byDevice, byBrowser,
    recentViews,
    revenueToday, revenueWeek, revenueMonth, revenueTotal,
    revenuePrevMonth,
    ordersToday, ordersWeek, ordersMonth, ordersTotal,
    paymentBreakdown,
    topProducts,
    newUsersToday, newUsersMonth,
    // Daily revenue for sparkline (last 14 days)
    dailyRevenue,
  ] = await Promise.all([
    pv.count({ where: { createdAt: { gte: last24h } } }),
    pv.count({ where: { createdAt: { gte: last7 } } }),
    pv.count({ where: { createdAt: { gte: last30 } } }),
    pv.groupBy({ by: ["ip"], where: { createdAt: { gte: last30 }, ip: { not: null } }, _count: true }).then((r: unknown[]) => r.length),
    pv.groupBy({ by: ["path"], where: { createdAt: { gte: last30 } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["country"], where: { createdAt: { gte: last30 }, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["referrer"], where: { createdAt: { gte: last30 }, referrer: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
    pv.groupBy({ by: ["device"], where: { createdAt: { gte: last30 }, device: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    pv.groupBy({ by: ["browser"], where: { createdAt: { gte: last30 }, browser: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 6 }),
    pv.findMany({ orderBy: { createdAt: "desc" }, take: 40, select: { path: true, country: true, device: true, browser: true, referrer: true, ip: true, sessionId: true, createdAt: true } }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: prevMonthStart, lt: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.groupBy({ by: ["paymentProvider"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } } }),
    db.order.groupBy({ by: ["productId"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.user.count({ where: { createdAt: { gte: monthStart } } }),
    // Last 14 days revenue
    db.$queryRaw`SELECT DATE("createdAt") as date, COALESCE(SUM(amount),0)::float as revenue, COUNT(*)::int as orders FROM "Order" WHERE status = 'PAID' AND "createdAt" >= ${new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)} GROUP BY DATE("createdAt") ORDER BY date ASC` as Promise<{ date: Date; revenue: number; orders: number }[]>,
  ]);

  const productIds = (topProducts as { productId: string }[]).map((p) => p.productId);
  const productTitles = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, title: true } });
  const titleMap = Object.fromEntries(productTitles.map((p) => [p.id, p.title]));

  const totalPaymentOrders = (paymentBreakdown as { _count: { id: number } }[]).reduce((s, p) => s + p._count.id, 0);

  // Build 14-day revenue map
  const revenueMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    revenueMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const row of dailyRevenue as { date: Date; revenue: number; orders: number }[]) {
    const key = new Date(row.date).toISOString().slice(0, 10);
    revenueMap.set(key, { revenue: Number(row.revenue), orders: Number(row.orders) });
  }
  const dailyData = Array.from(revenueMap.entries()).map(([date, v]) => ({ date, ...v }));
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);

  // Month-over-month change
  const prevMonthRevenue = Number(revenuePrevMonth._sum.amount ?? 0);
  const thisMonthRevenue = Number(revenueMonth._sum.amount ?? 0);
  const momChange = prevMonthRevenue > 0 ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  // Conversion rate (orders / unique visitors)
  const conversionRate = uniqueIPs30d > 0 ? ((ordersMonth / uniqueIPs30d) * 100).toFixed(1) : "0.0";

  type GroupRow = { _count: { id: number } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 size={22} className="text-purple-400" /> Analytics
        </h1>
        <span className="text-xs text-gray-600">Last updated: {now.toLocaleTimeString()}</span>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`$${Number(revenueToday._sum.amount ?? 0).toFixed(2)}`}
          sub={`${ordersToday} orders`} color="#4ade80" icon={DollarSign} />
        <StatCard label="This Week" value={`$${Number(revenueWeek._sum.amount ?? 0).toFixed(2)}`}
          sub={`${ordersWeek} orders`} color="#60a5fa" icon={TrendingUp} />
        <StatCard label="This Month" value={`$${thisMonthRevenue.toFixed(2)}`}
          sub={`${ordersMonth} orders`} color="#c4b5fd" icon={ShoppingCart} trend={momChange} />
        <StatCard label="All Time" value={`$${Number(revenueTotal._sum.amount ?? 0).toFixed(2)}`}
          sub={`${ordersTotal} paid orders`} color="#fbbf24" icon={DollarSign} />
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Views (24h)" value={views24h.toLocaleString()} color="#a78bfa" icon={Eye} />
        <StatCard label="Views (7d)" value={views7d.toLocaleString()} color="#818cf8" icon={BarChart2} />
        <StatCard label="Views (30d)" value={views30d.toLocaleString()} color="#6366f1" icon={TrendingUp} />
        <StatCard label="Unique Visitors (30d)" value={uniqueIPs30d.toLocaleString()}
          sub={`${conversionRate}% conversion`} color="#34d399" icon={Users} />
      </div>

      {/* User stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New Users Today" value={newUsersToday} color="#f472b6" icon={Users} />
        <StatCard label="New Users (Month)" value={newUsersMonth} color="#fb923c" icon={Users} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} sub="orders / unique visitors" color="#22d3ee" icon={TrendingUp} />
        <StatCard label="Avg Order Value" value={ordersTotal > 0 ? `$${(Number(revenueTotal._sum.amount ?? 0) / ordersTotal).toFixed(2)}` : "$0"} color="#a3e635" icon={DollarSign} />
      </div>

      {/* 14-day revenue sparkline */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp size={14} className="text-green-400" /> Revenue — Last 14 Days
        </h2>
        <div className="flex items-end gap-1.5 h-24">
          {dailyData.map(({ date, revenue, orders }) => {
            const height = maxRevenue > 0 ? Math.max(4, (revenue / maxRevenue) * 100) : 4;
            const label = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                  <div className="text-xs text-white px-2 py-1 rounded-lg whitespace-nowrap"
                    style={{ background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    ${revenue.toFixed(2)} · {orders} orders
                  </div>
                </div>
                <div className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${height}%`,
                    background: revenue > 0
                      ? "linear-gradient(180deg, #a78bfa, #6366f1)"
                      : "rgba(255,255,255,0.05)",
                    minHeight: "4px",
                  }} />
                <span className="text-[9px] text-gray-700 hidden sm:block">{label.split(" ")[1]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-700 mt-1">
          <span>{new Date(dailyData[0]?.date ?? now).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment methods */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-yellow-400" /> Payment Methods
          </h2>
          <div className="space-y-3">
            {(paymentBreakdown as { paymentProvider: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p) => {
              const pct = totalPaymentOrders > 0 ? Math.round((p._count.id / totalPaymentOrders) * 100) : 0;
              const color = PAYMENT_COLORS[p.paymentProvider] ?? "#9ca3af";
              return (
                <div key={p.paymentProvider}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium" style={{ color }}>{PAYMENT_LABELS[p.paymentProvider] ?? p.paymentProvider}</span>
                    <span className="text-gray-400 text-xs">{p._count.id} orders · ${Number(p._sum.amount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
            {(paymentBreakdown as unknown[]).length === 0 && <p className="text-gray-600 text-xs">No paid orders yet</p>}
          </div>
        </div>

        {/* Top products */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={14} className="text-purple-400" /> Top Products
          </h2>
          <div className="space-y-2.5">
            {(topProducts as { productId: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p, i) => {
              const maxOrders = (topProducts as { _count: { id: number } }[])[0]?._count.id ?? 1;
              return (
                <div key={p.productId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-600 w-4 shrink-0">#{i + 1}</span>
                      <Link href={`/admin/products/${p.productId}/inventory`}
                        className="text-gray-300 hover:text-white transition-colors truncate text-xs">
                        {titleMap[p.productId] ?? "Unknown"}
                      </Link>
                    </div>
                    <span className="text-white font-medium text-xs shrink-0 ml-2">
                      ${Number(p._sum.amount ?? 0).toFixed(2)}
                      <span className="text-gray-600 ml-1">({p._count.id})</span>
                    </span>
                  </div>
                  <MiniBar value={p._count.id} max={maxOrders} color="#a78bfa" />
                </div>
              );
            })}
            {(topProducts as unknown[]).length === 0 && <p className="text-gray-600 text-xs">No sales yet</p>}
          </div>
        </div>

        {/* Top pages */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye size={14} className="text-purple-400" /> Top Pages (30d)
          </h2>
          <div className="space-y-2">
            {(topPages as ({ path: string } & GroupRow)[]).map((p) => {
              const maxViews = (topPages as GroupRow[])[0]?._count.id ?? 1;
              return (
                <div key={p.path}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300 font-mono truncate max-w-[200px]">{p.path}</span>
                    <span className="text-purple-400 font-medium ml-2">{p._count.id.toLocaleString()}</span>
                  </div>
                  <MiniBar value={p._count.id} max={maxViews} color="#a78bfa" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top countries */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={14} className="text-green-400" /> Top Countries (30d)
          </h2>
          <div className="space-y-2">
            {(topCountries as ({ country: string } & GroupRow)[]).map((c) => {
              const maxViews = (topCountries as GroupRow[])[0]?._count.id ?? 1;
              return (
                <div key={c.country}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{c.country ?? "Unknown"}</span>
                    <span className="text-green-400 font-medium">{c._count.id.toLocaleString()}</span>
                  </div>
                  <MiniBar value={c._count.id} max={maxViews} color="#34d399" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Referrers */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 size={14} className="text-blue-400" /> Top Referrers (30d)
          </h2>
          <div className="space-y-2">
            {(topReferrers as ({ referrer: string } & GroupRow)[]).length === 0 && (
              <p className="text-gray-600 text-xs">No referrer data yet — most traffic is direct</p>
            )}
            {(topReferrers as ({ referrer: string } & GroupRow)[]).map((r) => {
              let host = r.referrer;
              try { host = new URL(r.referrer).hostname.replace("www.", ""); } catch {}
              return (
                <div key={r.referrer} className="flex items-center justify-between text-xs">
                  <span className="text-blue-400 truncate max-w-[200px]">{host}</span>
                  <span className="text-gray-400 font-medium ml-2">{r._count.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices & Browsers */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Monitor size={14} className="text-yellow-400" /> Devices & Browsers (30d)
          </h2>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Smartphone size={11} /> Device</p>
            <div className="flex gap-2 flex-wrap">
              {(byDevice as ({ device: string } & GroupRow)[]).map((d) => (
                <div key={d.device} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-gray-300">{d.device}</span>
                  <span className="text-yellow-400 font-medium">{d._count.id}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Chrome size={11} /> Browser</p>
            <div className="flex gap-2 flex-wrap">
              {(byBrowser as ({ browser: string } & GroupRow)[]).map((b) => (
                <div key={b.browser} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-gray-300">{b.browser}</span>
                  <span className="text-blue-400 font-medium">{b._count.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent visits */}
      <div className="glass-card overflow-x-auto">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin size={14} className="text-purple-400" /> Recent Visits
          </h2>
          <span className="text-xs text-gray-600">Last 40 page views</span>
        </div>
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-600 uppercase tracking-wider">
              <th className="text-left px-5 py-3">Path</th>
              <th className="text-left px-5 py-3">Country</th>
              <th className="text-left px-5 py-3">Device</th>
              <th className="text-left px-5 py-3">Source</th>
              <th className="text-left px-5 py-3">IP</th>
              <th className="text-left px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {(recentViews as { path: string; country: string | null; device: string | null; browser: string | null; referrer: string | null; ip: string | null; sessionId: string | null; createdAt: Date }[]).map((v, i) => {
              let referrerHost = "direct";
              try { if (v.referrer) referrerHost = new URL(v.referrer).hostname.replace("www.", ""); } catch {}
              const visitDate = new Date(v.createdAt);
              const diffMs = now.getTime() - visitDate.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const timeAgo = diffMins < 1 ? "just now" : diffMins < 60 ? `${diffMins}m ago` : diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago` : `${Math.floor(diffMins / 1440)}d ago`;
              return (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-purple-400 max-w-[180px] truncate">{v.path}</td>
                  <td className="px-5 py-2.5 text-gray-300">{v.country ?? "—"}</td>
                  <td className="px-5 py-2.5 text-gray-400">
                    {v.device ?? "—"}{v.browser ? <span className="text-gray-600"> / {v.browser}</span> : null}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={referrerHost === "direct" ? "text-gray-600" : "text-blue-400"}>{referrerHost}</span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-gray-600">
                    {v.ip ? (
                      <Link href={`/admin/ip-lookup?ip=${v.ip}`} className="hover:text-purple-400 transition-colors">
                        {v.ip}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-gray-500" title={visitDate.toLocaleString()}>{timeAgo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(recentViews as unknown[]).length === 0 && (
          <p className="text-center text-gray-600 py-10">No visits recorded yet.</p>
        )}
      </div>
    </div>
  );
}
