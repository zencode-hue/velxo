import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { ShoppingCart, Package, AlertTriangle, Users, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const session = await requireStaff();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders, todayOrders, weekOrders,
    pendingStock, totalProducts, lowStockProducts,
    totalCustomers, newCustomersWeek,
    recentOrders, todayRevenue, monthRevenue,
  ] = await Promise.all([
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "PAID", createdAt: { gte: todayStart } } }),
    db.order.count({ where: { status: "PAID", createdAt: { gte: weekStart } } }),
    db.order.count({ where: { status: "PENDING_STOCK" } }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true, stockCount: { lte: 3 }, unlimitedStock: false } as object }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: weekStart } } }),
    db.order.findMany({
      where: { status: { in: ["PAID", "PENDING_STOCK", "PENDING"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: { select: { title: true } }, user: { select: { email: true } } },
    }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true } }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
  ]);

  const todayRev = Number(todayRevenue._sum.amount ?? 0);
  const monthRev = Number(monthRevenue._sum.amount ?? 0);

  const staffMember = await (db as any).staffMember.findUnique({ // eslint-disable-line @typescript-eslint/no-explicit-any
    where: { id: session.id },
    select: { name: true, position: true, lastActiveAt: true },
  });

  // Update last active
  await (db as any).staffMember.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } });

  const STATUS_BADGE: Record<string, string> = {
    PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
    PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening"}, {staffMember?.name ?? session.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {staffMember?.position ?? "Staff Member"} · {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {pendingStock > 0 && (
          <Link href="/staff/pending-stock"
            className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-4 py-2 rounded-xl hover:bg-yellow-400/20 transition-colors">
            <AlertTriangle size={14} /> {pendingStock} pending stock order{pendingStock > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Revenue", value: `$${todayRev.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", sub: `${todayOrders} orders` },
          { label: "Month Revenue", value: `$${monthRev.toFixed(2)}`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", sub: `${weekOrders} this week` },
          { label: "Pending Stock", value: pendingStock, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", sub: "needs attention", link: "/staff/pending-stock" },
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", sub: `+${newCustomersWeek} this week` },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-5 ${s.link ? "cursor-pointer hover:border-blue-500/30 transition-colors" : ""}`}>
            {s.link ? (
              <Link href={s.link} className="block">
                <StatCard {...s} />
              </Link>
            ) : <StatCard {...s} />}
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Paid Orders", value: totalOrders, icon: CheckCircle, color: "text-green-400" },
          { label: "Today Orders", value: todayOrders, icon: Clock, color: "text-yellow-400" },
          { label: "Active Products", value: totalProducts, icon: Package, color: "text-purple-400" },
          { label: "Low Stock", value: lowStockProducts, icon: AlertTriangle, color: lowStockProducts > 0 ? "text-red-400" : "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <s.icon size={15} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="glass-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={15} className="text-purple-400" /> Recent Orders
          </h2>
          <Link href="/staff/orders" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-5 py-3 font-mono text-xs text-purple-400">VLX-{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-[140px]">
                    {o.user?.email ?? (o as { guestEmail?: string | null }).guestEmail ?? "Guest"}
                  </td>
                  <td className="px-5 py-3 text-white text-xs truncate max-w-[160px]">{o.product.title}</td>
                  <td className="px-5 py-3 text-right text-white font-medium">${Number(o.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-600 py-8">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; bg: string; sub?: string;
}) {
  return (
    <>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon size={16} className={color} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </>
  );
}
