import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Globe, DollarSign, ShoppingCart, Mail, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PAID: "badge-green", PENDING: "badge-yellow", FAILED: "badge-red",
  PENDING_STOCK: "badge-yellow", REFUNDED: "badge-purple",
};

const PAYMENT_SHORT: Record<string, string> = {
  nowpayments: "Crypto", balance: "Wallet",
  binance_gift_card: "Gift Card", discord: "Discord",
};

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const rawId = decodeURIComponent(params.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  // Try user ID or email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (db.user.findFirst as any)({
    where: { OR: [{ id: rawId }, { email: rawId }] },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      balance: true, isBanned: true, banReason: true,
      affiliate: {
        select: {
          referralCode: true, totalEarned: true, pendingPayout: true, commissionPct: true,
          _count: { select: { referrals: true } },
        },
      },
    },
  }) as {
    id: string; email: string; name: string | null; role: string; createdAt: Date;
    balance: { toString(): string }; isBanned: boolean; banReason: string | null;
    affiliate: { referralCode: string; totalEarned: { toString(): string }; pendingPayout: { toString(): string }; commissionPct: { toString(): string }; _count: { referrals: number } } | null;
  } | null;

  const lookupEmail = user?.email ?? (rawId.includes("@") ? rawId : null);
  if (!user && !lookupEmail) notFound();

  const email = user?.email ?? lookupEmail ?? "Unknown";

  // Get all orders for this customer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = await (db.order.findMany as any)({
    where: user
      ? { userId: user.id }
      : { guestEmail: lookupEmail },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, amount: true, discountAmount: true, status: true,
      paymentProvider: true, createdAt: true,
      product: { select: { title: true, category: true } },
    },
  }) as Array<{
    id: string; amount: { toString(): string }; discountAmount: { toString(): string };
    status: string; paymentProvider: string; createdAt: Date;
    product: { title: string; category: string };
  }>;

  // Get last known device info — for registered users match by userId, for guests match by sessionId correlation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  let lastView = null;
  let recentPaths: { path: string; createdAt: Date }[] = [];

  if (user) {
    // Registered user — look up by userId
    lastView = await pv.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { ip: true, country: true, browser: true, os: true, device: true, userAgent: true, referrer: true, createdAt: true, path: true },
    });
    recentPaths = await pv.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { path: true, createdAt: true },
    });
  } else if (lookupEmail) {
    // Guest — we can't directly link page views to a guest email
    // Show a note that tracking requires login
    lastView = null;
  }

  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((s, o) => s + Number(o.amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/customers" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Customer Details</h1>
          <p className="text-xs text-gray-500 mt-0.5">{email}</p>
        </div>
        <div className="ml-auto">
          <Link href={`/admin/email?prefill=${encodeURIComponent(email)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <Mail size={14} /> Send Email
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* General Info */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User size={14} className="text-purple-400" /> General Information
          </h2>
          <div className="space-y-3 text-sm">
            <Row label="Email Address" value={email} />
            <Row label="Customer Type" value={user ? "Registered" : "Guest"} valueClass={user ? "text-green-400" : "text-yellow-400"} />
            {user?.name && <Row label="Name" value={user.name} />}
            {user && <Row label="Balance" value={`$${Number(user.balance).toFixed(2)}`} valueClass="text-cyan-400" />}
            {user && <Row label="Role" value={user.role} />}
            {user && <Row label="Registered At" value={new Date(user.createdAt).toLocaleString()} />}
            {user?.isBanned && <Row label="Status" value={`BANNED${user.banReason ? ` — ${user.banReason}` : ""}`} valueClass="text-red-400" />}
            {user?.affiliate && (
              <>
                <Row label="Affiliate Code" value={user.affiliate.referralCode} valueClass="font-mono text-purple-300" />
                <Row label="Referrals" value={String(user.affiliate._count.referrals)} />
                <Row label="Total Earned" value={`$${Number(user.affiliate.totalEarned).toFixed(2)}`} valueClass="text-green-400" />
                <Row label="Pending Payout" value={`$${Number(user.affiliate.pendingPayout).toFixed(2)}`} valueClass="text-yellow-400" />
              </>
            )}
          </div>
        </div>

        {/* Last Known Device */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={14} className="text-blue-400" /> Last Known Device Info
          </h2>
          {lastView ? (
            <div className="space-y-3 text-sm">
              <Row label="IP Address" value={(lastView as { ip: string | null }).ip ?? "—"} valueClass="font-mono text-xs" />
              <Row label="Country" value={(lastView as { country: string | null }).country ?? "—"} />
              <Row label="Browser" value={(lastView as { browser: string | null }).browser ?? "—"} />
              <Row label="Operating System" value={(lastView as { os: string | null }).os ?? "—"} />
              <Row label="Device" value={(lastView as { device: string | null }).device ?? "—"} />
              <Row label="Last Visit" value={new Date((lastView as { createdAt: Date }).createdAt).toLocaleString()} />
              <Row label="Last Page" value={(lastView as { path: string }).path} valueClass="font-mono text-xs text-purple-300" />
              {(lastView as { userAgent: string | null }).userAgent && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">User Agent</p>
                  <p className="text-gray-400 text-xs break-all leading-relaxed">{(lastView as { userAgent: string | null }).userAgent}</p>
                </div>
              )}
              {recentPaths.length > 1 && (
                <div>
                  <p className="text-gray-500 text-xs mb-2">Recent Pages Visited</p>
                  <div className="space-y-1">
                    {recentPaths.slice(0, 8).map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-mono text-xs text-purple-300 truncate max-w-[180px]">{(p as { path: string }).path}</span>
                        <span className="text-gray-600 text-xs">{new Date((p as { createdAt: Date }).createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              {user ? "No page view data yet for this user." : "Page view tracking requires a registered account. Guest visitors are not tracked individually."}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Invoices Completed", value: paidOrders.length, icon: ShoppingCart, color: "text-purple-400" },
          { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
          { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, icon: DollarSign, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Icon size={12} className={color} /> {label}
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={14} className="text-purple-400" /> Invoices ({allOrders.length})
          </h2>
        </div>
        {allOrders.length === 0 ? (
          <p className="text-center text-gray-600 py-10 text-sm">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-5 py-3">Invoice</th>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Payment</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-5 py-3 font-mono text-xs text-purple-400">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-white text-xs truncate max-w-[160px]">{o.product.title}</td>
                  <td className="px-5 py-3 text-right text-white">${Number(o.amount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{PAYMENT_SHORT[o.paymentProvider] ?? o.paymentProvider}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={STATUS_BADGE[o.status] ?? "badge-purple"}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <a href={`${appUrl}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500 shrink-0 text-xs">{label}</span>
      <span className={`text-right text-xs ${valueClass ?? "text-gray-300"}`}>{value}</span>
    </div>
  );
}
