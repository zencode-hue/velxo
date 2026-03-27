import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ShoppingCart } from "lucide-react";
import RedeliverButton from "./RedeliverButton";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true } },
      product: { select: { title: true } },
      deliveryLog: { select: { id: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <ShoppingCart size={22} className="text-purple-400" /> Orders
      </h1>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Order ID</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-gray-300 truncate max-w-[160px]">{o.user.email}</td>
                <td className="px-4 py-3 text-white truncate max-w-[160px]">{o.product.title}</td>
                <td className="px-4 py-3 text-right text-white">${Number(o.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {o.status === "PAID" && !o.deliveryLog && (
                    <RedeliverButton orderId={o.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-gray-600 py-12">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
