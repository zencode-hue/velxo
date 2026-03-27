import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { Package, ShoppingBag, Star, Users, Copy } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Velxo",
  description: "View your orders, deliveries, and affiliate stats.",
};

async function getDashboardData(userId: string) {
  const [orders, affiliate] = await Promise.all([
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { title: true, category: true } },
        deliveryLog: {
          include: {
            inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } },
          },
        },
      },
    }),
    db.affiliate.findUnique({
      where: { userId },
      include: { _count: { select: { referrals: true } } },
    }),
  ]);

  const ordersWithCredentials = orders.map((order) => {
    let credentials: string | null = null;
    if (order.deliveryLog?.inventoryItem) {
      try {
        const { encryptedData, iv, authTag } = order.deliveryLog.inventoryItem;
        credentials = decrypt(encryptedData, iv, authTag);
      } catch {
        credentials = null;
      }
    }
    return {
      id: order.id,
      productTitle: order.product.title,
      productCategory: order.product.category,
      amount: Number(order.amount),
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.deliveryLog?.deliveredAt ?? null,
      credentials,
    };
  });

  return { orders: ordersWithCredentials, affiliate };
}

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green",
  PENDING: "badge-yellow",
  FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow",
  REFUNDED: "badge-purple",
};

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const { orders, affiliate } = await getDashboardData(session.user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session.user.name ?? session.user.email}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Orders", value: orders.length, icon: <ShoppingBag size={18} className="text-purple-400" /> },
          { label: "Delivered", value: orders.filter((o) => o.status === "PAID" && o.credentials).length, icon: <Package size={18} className="text-green-400" /> },
          { label: "Referrals", value: affiliate?._count.referrals ?? 0, icon: <Users size={18} className="text-blue-400" /> },
          { label: "Earned", value: `$${(affiliate ? Number(affiliate.totalEarned) : 0).toFixed(2)}`, icon: <Star size={18} className="text-yellow-400" /> },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm">{stat.icon}{stat.label}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Affiliate section */}
      {affiliate && (
        <div className="glass-card p-6 mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> Affiliate Program
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Your referral link</p>
              <code className="text-sm text-purple-300 break-all">
                {appUrl}/auth/register?ref={affiliate.referralCode}
              </code>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-white font-bold">{affiliate._count.referrals}</div>
                <div className="text-gray-500">Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">${Number(affiliate.pendingPayout).toFixed(2)}</div>
                <div className="text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders */}
      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <ShoppingBag size={18} className="text-purple-400" /> Order History
      </h2>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Package size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex text-sm px-6 py-2">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{order.productTitle}</span>
                    <span className="badge-purple text-xs">{CATEGORY_LABELS[order.productCategory] ?? order.productCategory}</span>
                    <span className={`${STATUS_BADGE[order.status] ?? "badge-purple"} text-xs`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Order #{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-lg font-bold text-white">${order.amount.toFixed(2)}</span>
              </div>

              {order.credentials && (
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-purple-600/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Credentials / License Key</span>
                    <Copy size={13} className="text-gray-600 cursor-pointer hover:text-purple-400 transition-colors" />
                  </div>
                  <code className="text-sm text-purple-300 break-all">{order.credentials}</code>
                </div>
              )}

              {order.status === "PENDING_STOCK" && (
                <p className="text-xs text-yellow-400 mt-2">⏳ Awaiting stock — you will be notified when your order is fulfilled.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
