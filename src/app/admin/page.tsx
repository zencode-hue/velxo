import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

async function getAnalytics() {
  const [
    totalRevenue,
    ordersByStatus,
    topProducts,
    recentUsers,
    totalUsers,
  ] = await Promise.all([
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.groupBy({ by: ["status"], _count: { id: true } }),
    db.order.groupBy({
      by: ["productId"],
      where: { status: "PAID" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    db.user.count(),
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, category: true },
  });

  const topWithTitles = topProducts.map((tp) => ({
    ...tp,
    product: products.find((p) => p.id === tp.productId),
  }));

  return { totalRevenue, ordersByStatus, topProducts: topWithTitles, recentUsers, totalUsers };
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "text-green-400",
  PENDING: "text-yellow-400",
  FAILED: "text-red-400",
  PENDING_STOCK: "text-orange-400",
  REFUNDED: "text-purple-400",
};

export default async function AdminDashboard() {
  await requireAdmin();
  const { totalRevenue, ordersByStatus, topProducts, recentUsers, totalUsers } = await getAnalytics();

  const revenue = Number(totalRevenue._sum.amount ?? 0);
  const totalOrders = ordersByStatus.reduce((sum, s) => sum + s._count.id, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, icon: <DollarSign size={18} className="text-green-400" /> },
          { label: "Total Orders", value: totalOrders, icon: <ShoppingCart size={18} className="text-purple-400" /> },
          { label: "Total Users", value: totalUsers, icon: <Users size={18} className="text-blue-400" /> },
          { label: "New Users (30d)", value: recentUsers, icon: <Package size={18} className="text-yellow-400" /> },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">{kpi.icon}{kpi.label}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${STATUS_COLORS[s.status] ?? "text-gray-400"}`}>{s.status}</span>
                <span className="text-white font-bold">{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((tp, i) => (
              <div key={tp.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                  <span className="text-sm text-gray-300 truncate max-w-[200px]">{tp.product?.title ?? tp.productId}</span>
                </div>
                <span className="text-white font-bold text-sm">{tp._count.id} sales</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-gray-600">No sales yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
