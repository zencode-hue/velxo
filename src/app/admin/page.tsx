import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminDashboard() {
  await requireAdmin();
  const [totalUsers, revenue, totalOrders] = await Promise.all([
    db.user.count(),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.count(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="text-gray-500 text-sm mb-2">Total Revenue</div>
          <div className="text-2xl font-bold text-white">${Number(revenue._sum.amount ?? 0).toFixed(2)}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-gray-500 text-sm mb-2">Total Orders</div>
          <div className="text-2xl font-bold text-white">{totalOrders}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-gray-500 text-sm mb-2">Total Users</div>
          <div className="text-2xl font-bold text-white">{totalUsers}</div>
        </div>
      </div>
    </div>
  );
}
