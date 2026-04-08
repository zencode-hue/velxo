import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const session = await requireStaff();

  const [totalOrders, pendingStock, totalProducts, recentOrders] = await Promise.all([
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "PENDING_STOCK" } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      where: { status: { in: ["PAID", "PENDING_STOCK"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: { select: { title: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {session.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <ShoppingCart size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Paid Orders</p>
            <p className="text-2xl font-bold text-white">{totalOrders}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Pending Stock</p>
            <p className="text-2xl font-bold text-white">{pendingStock}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Package size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Active Products</p>
            <p className="text-2xl font-bold text-white">{totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
          <TrendingUp size={16} className="text-orange-400" />
          <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-5 py-3">Order ID</th>
              <th className="text-left px-5 py-3">Product</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-5 py-3 font-mono text-xs text-purple-400">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-5 py-3 text-white truncate max-w-[180px]">{o.product.title}</td>
                <td className="px-5 py-3 text-right text-white">${Number(o.amount).toFixed(2)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={o.status === "PAID" ? "badge-green" : "badge-yellow"}>{o.status}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-600 py-8">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
