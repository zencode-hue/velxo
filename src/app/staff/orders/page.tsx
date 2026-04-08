import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet", binance_gift_card: "Gift Card", discord: "Discord",
};

export default async function StaffOrdersPage() {
  await requireStaff();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { title: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <ShoppingCart size={22} className="text-purple-400" /> Orders
        <span className="text-sm font-normal text-gray-500 ml-2">({orders.length})</span>
      </h1>

      <div className="glass-card overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-purple-400">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-[160px]">
                  {o.user?.email ?? (o as { guestEmail?: string | null }).guestEmail ?? "Guest"}
                </td>
                <td className="px-4 py-3 text-white text-xs truncate max-w-[160px]">{o.product.title}</td>
                <td className="px-4 py-3 text-right text-white font-medium">${Number(o.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</td>
                <td className="px-4 py-3 text-center">
                  <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-600 py-12">No orders yet.</p>}
      </div>
    </div>
  );
}
