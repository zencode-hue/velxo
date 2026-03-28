import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Package, ArrowLeft, Copy, ExternalLink } from "lucide-react";
import CopyInvoiceButton from "./CopyInvoiceButton";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string; desc: string }> = {
  PAID: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "Payment Confirmed", desc: "Your order has been paid and delivered." },
  PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Awaiting Payment", desc: "Complete your payment to receive your product." },
  PENDING_STOCK: { icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Awaiting Stock", desc: "Your payment was received. We're preparing your order." },
  FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Payment Failed", desc: "Your payment could not be processed." },
  REFUNDED: { icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Refunded", desc: "This order has been refunded." },
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default async function OrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const order = await db.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      product: { select: { title: true, category: true, imageUrl: true, price: true } },
      deliveryLog: {
        include: { inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } } },
      },
    },
  });

  if (!order) redirect("/dashboard");

  let credentials: string | null = null;
  if (order.deliveryLog?.inventoryItem) {
    try {
      const { encryptedData, iv, authTag } = order.deliveryLog.inventoryItem;
      credentials = decrypt(encryptedData, iv, authTag);
    } catch { credentials = null; }
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 50%)" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Status banner */}
        <div className={`rounded-2xl p-6 mb-6 border ${status.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon size={24} className={status.color} />
            <h1 className="text-xl font-bold text-white">{status.label}</h1>
          </div>
          <p className="text-sm text-gray-400">{status.desc}</p>
        </div>

        {/* Invoice */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Invoice header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice</p>
              <p className="font-mono text-sm text-white mt-0.5">#{order.id.slice(0, 16).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="text-xs text-gray-600 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Product */}
          <div className="px-6 py-5 border-b border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Product</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
                <Package size={20} className="text-purple-400/60" />
              </div>
              <div>
                <p className="font-semibold text-white">{order.product.title}</p>
                <p className="text-xs text-gray-500">{CATEGORY_LABELS[order.product.category] ?? order.product.category}</p>
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="px-6 py-5 border-b border-white/5 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Payment Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${(Number(order.amount) + Number(order.discountAmount)).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Discount</span>
                <span className="text-green-400">-${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2">
              <span className="text-white">Total Paid</span>
              <span className="text-white text-base">${Number(order.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Payment Method</span>
              <span className="capitalize">{order.paymentProvider}</span>
            </div>
            {order.paymentRef && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Payment Ref</span>
                <span className="font-mono">{order.paymentRef.slice(0, 20)}…</span>
              </div>
            )}
          </div>

          {/* Credentials */}
          {credentials && (
            <div className="px-6 py-5 border-b border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Credentials</p>
              <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-400 font-medium">License Key / Credentials</span>
                  <CopyInvoiceButton text={credentials} />
                </div>
                <code className="text-sm text-purple-300 break-all font-mono">{credentials}</code>
              </div>
              <p className="text-xs text-gray-600 mt-2">⚠️ Keep these credentials safe. Do not share them.</p>
            </div>
          )}

          {order.status === "PENDING_STOCK" && (
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <Clock size={14} />
                <span>Your order is queued. You&apos;ll receive credentials via email once stock is available.</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <ArrowLeft size={14} /> My Orders
            </Link>
            <Link href="/products" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white border border-white/8 hover:border-white/20 transition-all">
              <ExternalLink size={14} /> Browse More
            </Link>
            {order.status === "PENDING" && (
              <Link href={`/checkout/confirm?productId=${order.productId}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                Complete Payment
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Need help? <Link href="/support" className="text-purple-400 hover:text-purple-300">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
