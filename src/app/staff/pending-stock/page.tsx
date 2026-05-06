import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffPendingStockPage() {
  await requireStaff();

  const orders = await db.order.findMany({
    where: { status: "PENDING_STOCK" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { email: true } },
      product: { select: { title: true, stockCount: true, unlimitedStock: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <AlertTriangle size={22} className="text-yellow-400" /> Pending Stock Queue
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Paid orders waiting for inventory. Contact an admin to add stock and re-deliver.
      </p>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <AlertTriangle size={40} className="mx-auto mb-4 opacity-20" />
          <p>No pending stock orders. All caught up!</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Waiting Since</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const waitingDays = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 font-mono text-xs text-amber-400">{o.id.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-[160px]">
                      {o.user?.email ?? (o as { guestEmail?: string | null }).guestEmail ?? "Guest"}
                    </td>
                    <td className="px-4 py-3 text-white text-xs truncate max-w-[160px]">{o.product.title}</td>
                    <td className="px-4 py-3 text-right text-white">${Number(o.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={o.product.unlimitedStock ? "text-amber-400 text-xs" : o.product.stockCount > 0 ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                        {o.product.unlimitedStock ? "∞" : o.product.stockCount === 0 ? "Out of stock" : `${o.product.stockCount} available`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={waitingDays > 1 ? "text-red-400" : "text-yellow-400"}>
                        {waitingDays === 0 ? "Today" : `${waitingDays}d ago`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
