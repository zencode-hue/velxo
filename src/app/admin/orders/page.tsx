import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ShoppingCart, ExternalLink } from "lucide-react";
import RedeliverButton from "./RedeliverButton";
import OrderActions from "./OrderActions";
import GiftCardApproveButton from "./GiftCardApproveButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto",
  balance: "Wallet",
  binance_gift_card: "Gift Card",
  discord: "Discord",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { title: true } },
      deliveryLog: { select: { id: true } },
    },
  }) as Array<{
    id: string; amount: unknown; discountAmount: unknown; status: string; paymentProvider: string;
    createdAt: Date; adminNote?: string | null; guestEmail?: string | null;
    user: { id: string; email: string; name: string | null } | null;
    product: { title: string }; deliveryLog: { id: string } | null;
  }>;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart size={22} className="text-purple-400" /> Invoices
          <span className="text-sm font-normal text-gray-500 ml-2">({orders.length})</span>
        </h1>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Invoice</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const customerEmail = o.user?.email ?? o.guestEmail ?? "Guest";
              const customerId = o.user?.id;
              const lookupEmail = o.guestEmail ?? null;
              return (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  {/* Invoice ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </a>
                      <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={10} className="text-gray-600 hover:text-gray-400" />
                      </a>
                    </div>
                    {(o as { adminNote?: string | null }).adminNote && (
                      <p className="text-yellow-400/70 text-xs mt-0.5 truncate max-w-[120px]">
                        {(o as { adminNote?: string | null }).adminNote}
                      </p>
                    )}
                  </td>

                  {/* Customer — clickable */}
                  <td className="px-4 py-3">
                    {customerId ? (
                      <Link href={`/admin/customers/${customerId}`}
                        className="text-gray-300 hover:text-white transition-colors truncate max-w-[160px] block text-xs underline decoration-dotted underline-offset-2">
                        {customerEmail}
                      </Link>
                    ) : lookupEmail ? (
                      <Link href={`/admin/customers/${encodeURIComponent(lookupEmail)}`}
                        className="text-gray-400 hover:text-white transition-colors truncate max-w-[160px] block text-xs underline decoration-dotted underline-offset-2">
                        {customerEmail}
                      </Link>
                    ) : (
                      <span className="text-gray-500 text-xs">{customerEmail}</span>
                    )}
                    {o.user?.name && <p className="text-gray-600 text-xs">{o.user.name}</p>}
                  </td>

                  <td className="px-4 py-3 text-white truncate max-w-[160px] text-xs">{o.product.title}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-medium">${Number(o.amount).toFixed(2)}</span>
                    {Number(o.discountAmount) > 0 && (
                      <p className="text-green-400 text-xs">-${Number(o.discountAmount).toFixed(2)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      {o.status === "PAID" && !o.deliveryLog && <RedeliverButton orderId={o.id} />}
                      {o.status === "PENDING_STOCK" && o.paymentProvider === "binance_gift_card" && (
                        <GiftCardApproveButton orderId={o.id} />
                      )}
                      <OrderActions orderId={o.id} currentStatus={o.status} currentNote={(o as { adminNote?: string | null }).adminNote} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-600 py-12">No invoices yet.</p>}
      </div>
    </div>
  );
}
