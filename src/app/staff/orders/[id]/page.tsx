import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
  PAID: { color: "text-green-400", label: "Delivered", icon: CheckCircle },
  PENDING: { color: "text-yellow-400", label: "Pending Payment", icon: Clock },
  PENDING_STOCK: { color: "text-yellow-400", label: "Pending Stock", icon: Clock },
  FAILED: { color: "text-red-400", label: "Failed", icon: XCircle },
  REFUNDED: { color: "text-purple-400", label: "Refunded", icon: CheckCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet", binance_gift_card: "Gift Card", discord: "Discord", flutterwave: "Card",
};

export default async function StaffOrderDetailPage({ params }: { params: { id: string } }) {
  await requireStaff();

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, title: true, category: true, imageUrl: true } },
      user: { select: { id: true, email: true, name: true, createdAt: true } },
      deliveryLog: {
        include: { inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } } },
      },
    },
  });

  if (!order) notFound();

  let credentials: string | null = null;
  if (order.deliveryLog?.inventoryItem) {
    try {
      credentials = decrypt(
        order.deliveryLog.inventoryItem.encryptedData,
        order.deliveryLog.inventoryItem.iv,
        order.deliveryLog.inventoryItem.authTag
      );
    } catch { credentials = null; }
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const customerEmail = order.user?.email ?? order.guestEmail ?? "Guest";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/staff/orders" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white font-mono">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className={`ml-auto flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
          <StatusIcon size={14} />
          {status.label}
        </div>
      </div>

      <div className="space-y-4">
        {/* Product */}
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Package size={12} /> Product
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Package size={18} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
            <div>
              <p className="text-white font-medium">{order.product.title}</p>
              <p className="text-xs text-gray-500">{order.product.category}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white font-bold">${Number(order.amount).toFixed(2)}</p>
              {Number(order.discountAmount) > 0 && (
                <p className="text-xs text-green-400">-${Number(order.discountAmount).toFixed(2)} discount</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User size={12} /> Customer
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{customerEmail}</span>
            </div>
            {order.user?.name && (
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white">{order.user.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white">{order.userId ? "Registered" : "Guest"}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="glass-card p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard size={12} /> Payment
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Method</span>
              <span className="text-white">{PAYMENT_LABELS[order.paymentProvider] ?? order.paymentProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <span className="text-white font-bold">${Number(order.amount).toFixed(2)}</span>
            </div>
            {order.paymentRef && (
              <div className="flex justify-between">
                <span className="text-gray-400">Ref</span>
                <span className="text-white font-mono text-xs">{order.paymentRef}</span>
              </div>
            )}
            {order.adminNote && (
              <div className="flex justify-between">
                <span className="text-gray-400">Note</span>
                <span className="text-yellow-400 text-xs">{order.adminNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery */}
        {credentials && (
          <div className="glass-card p-5" style={{ borderColor: "rgba(167,139,250,0.2)" }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Delivered Credentials</p>
            <code className="text-sm text-purple-300 break-all font-mono block p-3 rounded-xl"
              style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
              {credentials}
            </code>
            <p className="text-xs text-gray-600 mt-2">
              Delivered: {order.deliveryLog?.deliveredAt ? new Date(order.deliveryLog.deliveredAt).toLocaleString() : "—"}
            </p>
          </div>
        )}

        {!order.deliveryLog && order.status === "PAID" && (
          <div className="glass-card p-4 text-center text-yellow-400 text-sm">
            ⚠️ Order is PAID but no delivery log found. Use Re-deliver from the orders list.
          </div>
        )}
      </div>
    </div>
  );
}
