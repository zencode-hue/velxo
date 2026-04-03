import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Clock, XCircle, Package, ArrowLeft, ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string; desc: string }> = {
  PAID: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "Delivered", desc: "Payment confirmed and product delivered." },
  PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Awaiting Payment", desc: "Complete your payment to receive your product." },
  PENDING_STOCK: { icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Processing", desc: "Payment received. Preparing your order." },
  FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Payment Failed", desc: "Payment could not be processed." },
  REFUNDED: { icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Refunded", desc: "This order has been refunded." },
};

const PAYMENT_LABELS: Record<string, string> = {
  nowpayments: "Crypto (NOWPayments)",
  balance: "Wallet Balance",
  binance_gift_card: "Binance Gift Card",
  discord: "Discord Manual",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Invoice #${params.id.slice(0, 8).toUpperCase()} - Velxo Shop`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { title: true, category: true, imageUrl: true, price: true } },
      deliveryLog: {
        include: { inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } } },
      },
    },
  });

  if (!order) notFound();

  let credentials: string | null = null;
  if (order.deliveryLog?.inventoryItem) {
    try {
      const { encryptedData, iv, authTag } = order.deliveryLog.inventoryItem;
      credentials = decrypt(encryptedData, iv, authTag);
    } catch { credentials = null; }
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const invoiceNum = order.id.slice(0, 8).toUpperCase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  // Steps
  const steps = [
    { label: "Order Placed", done: true, time: new Date(order.createdAt).toLocaleString() },
    { label: "Payment Confirmed", done: ["PAID", "PENDING_STOCK", "REFUNDED"].includes(order.status), time: order.status === "PAID" ? "Confirmed" : null },
    { label: "Product Delivered", done: order.status === "PAID" && !!order.deliveryLog, time: order.deliveryLog ? "Delivered" : null },
  ];

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 50%)" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Velxo Shop
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Invoice</p>
            <h1 className="text-2xl font-bold text-white font-mono">#{invoiceNum}</h1>
            <p className="text-xs text-gray-600 mt-1">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
            <StatusIcon size={14} />
            {status.label}
          </div>
        </div>

        {/* Progress steps */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-start gap-0">
            {steps.map((s, i) => (
              <div key={s.label} className="flex-1 flex flex-col items-center relative">
                {i < steps.length - 1 && (
                  <div className={`absolute top-3.5 left-1/2 w-full h-px ${s.done ? "bg-green-500/50" : "bg-white/10"}`} />
                )}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 shrink-0 ${s.done ? "bg-green-500" : "bg-white/10"}`}>
                  {s.done ? <CheckCircle size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                </div>
                <p className={`text-xs mt-2 text-center font-medium ${s.done ? "text-white" : "text-gray-600"}`}>{s.label}</p>
                {s.time && <p className="text-xs text-gray-600 mt-0.5 text-center">{s.time}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Items</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}>
              {order.product.imageUrl ? (
                <Image src={order.product.imageUrl} alt={order.product.title} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"><Package size={22} className="text-purple-400/50" /></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{order.product.title}</p>
              <p className="text-xs text-gray-500">{CATEGORY_LABELS[order.product.category] ?? order.product.category} · 1 year subscription</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">${Number(order.amount).toFixed(2)}</p>
              <p className="text-xs text-green-400 capitalize">{order.status === "PAID" ? "Delivered" : order.status.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Payment Details</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${(Number(order.amount) + Number(order.discountAmount)).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-green-400">Discount</span>
                <span className="text-green-400">-${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-white/5 pt-2.5">
              <span className="text-white">Total Paid</span>
              <span className="text-white">${Number(order.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Payment Method</span>
              <span>{PAYMENT_LABELS[order.paymentProvider] ?? order.paymentProvider}</span>
            </div>
          </div>
        </div>

        {/* Credentials — only shown if delivered */}
        {credentials && (
          <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Credentials</p>
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <code className="text-sm text-purple-300 break-all font-mono flex-1">{credentials}</code>
              <CopyButton text={credentials} />
            </div>
            <p className="text-xs text-gray-600 mt-2">⚠️ Keep these credentials safe. Do not share them.</p>
          </div>
        )}

        {/* Pending stock — Discord claim */}
        {order.status === "PENDING_STOCK" && (
          <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <p className="text-sm font-semibold text-orange-400 mb-3">Claim Your Product on Discord</p>
            <p className="text-xs text-gray-400 mb-3">Your payment was received but stock is temporarily unavailable. Join our Discord and share your Invoice ID to claim your product.</p>
            <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <code className="font-mono text-sm text-orange-300 flex-1 break-all">{order.id}</code>
              <CopyButton text={order.id} />
            </div>
            <a href="https://discord.gg/2b8AkfW6EP" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #5865f2, #7289da)" }}>
              <ExternalLink size={14} /> Join Discord to Claim
            </a>
          </div>
        )}

        {/* Invoice ID */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice ID</p>
            <CopyButton text={order.id} label="Copy ID" />
          </div>
          <code className="font-mono text-xs text-gray-400 break-all">{order.id}</code>
          <p className="text-xs text-gray-700 mt-2">Share this link to access this invoice: {appUrl}/invoice/{order.id}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 transition-all">
            Browse More
          </Link>
          <Link href="/support"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 transition-all">
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
