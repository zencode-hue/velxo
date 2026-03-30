import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle } from "lucide-react";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalUsers, revenue, totalOrders, pendingOrders, lowStockProducts] = await Promise.all([
    db.user.count(),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.count(),
    db.order.count({ where: { status: "PENDING_STOCK" } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.product.findMany as any)({
      where: { isActive: true, unlimitedStock: false, stockCount: { lte: 3 } },
      select: { id: true, title: true, stockCount: true },
      orderBy: { stockCount: "asc" },
      take: 5,
    }) as Promise<{ id: string; title: string; stockCount: number }[]>,
  ]);

  const stats = [
    { label: "Total Revenue", value: `$${Number(revenue._sum.amount ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-purple-400" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Pending Stock", value: pendingOrders, icon: Package, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Icon size={15} className={color} /> {label}
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
      <RevenueChart />
      {(lowStockProducts as { id: string; title: string; stockCount: number }[]).length > 0 && (
        <div className="glass-card p-5 border border-orange-500/20">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-400" /> Low Stock Alert
          </h2>
          <div className="space-y-2">
            {(lowStockProducts as { id: string; title: string; stockCount: number }[]).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{p.title}</span>
                <span className={`font-medium ${p.stockCount === 0 ? "text-red-400" : "text-orange-400"}`}>
                  {p.stockCount === 0 ? "Out of stock" : `${p.stockCount} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
