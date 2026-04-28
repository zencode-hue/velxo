import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { ShoppingBag, Package } from "lucide-react";
import CopyButton from "../CopyButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};
const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { title: true, category: true } },
      deliveryLog: { include: { inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } } } },
    },
  });

  const enriched = orders.map((order) => {
    let credentials: string | null = null;
    if (order.deliveryLog?.inventoryItem) {
      try { credentials = decrypt(order.deliveryLog.inventoryItem.encryptedData, order.deliveryLog.inventoryItem.iv, order.deliveryLog.inventoryItem.authTag); }
      catch { credentials = null; }
    }
    return { ...order, amount: Number(order.amount), credentials };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <ShoppingBag size={22} className="text-purple-400" /> My Orders
      </h1>
      <p className="text-gray-500 text-sm mb-8">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>

      {enriched.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Package size={40} className="mx-auto mb-4 opacity-30" />
          <p>No orders yet.</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex text-sm px-6 py-2.5">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enriched.map((order) => (
            <div key={order.id} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{order.product.title}</span>
                    <span className="badge-purple text-xs">{CATEGORY_LABELS[order.product.category] ?? order.product.category}</span>
                    <span className={`${STATUS_BADGE[order.status] ?? "badge-purple"} text-xs`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <Link href={`/invoice/${order.id}`} className="text-purple-400 hover:text-purple-300">VLX-{order.id.slice(-6).toUpperCase()}</Link>
                    {" · "}{new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-lg font-bold text-white">${order.amount.toFixed(2)}</span>
              </div>
              {order.credentials && (
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-purple-600/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Credentials / License Key</span>
                    <CopyButton text={order.credentials} />
                  </div>
                  <code className="text-sm text-purple-300 break-all">{order.credentials}</code>
                </div>
              )}
              {order.status === "PENDING_STOCK" && (
                <p className="text-xs text-yellow-400 mt-2">Awaiting stock — you&apos;ll be notified when fulfilled.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
