import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await (db.user.findMany as any)({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true, email: true, name: true, createdAt: true, balance: true, isBanned: true,
      orders: { where: { status: "PAID" }, select: { amount: true } },
    },
  }) as Array<{
    id: string; email: string; name: string | null; createdAt: Date;
    balance: { toString(): string }; isBanned: boolean;
    orders: { amount: { toString(): string } }[];
  }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guestOrders = await (db.order.findMany as any)({
    where: { guestEmail: { not: null }, userId: null },
    orderBy: { createdAt: "desc" },
    select: { guestEmail: true, amount: true, status: true, createdAt: true },
  }) as Array<{ guestEmail: string | null; amount: { toString(): string }; status: string; createdAt: Date }>;

  const guestMap = new Map<string, { email: string; orders: number; spent: number; lastOrder: Date }>();
  for (const o of guestOrders) {
    if (!o.guestEmail) continue;
    const existing = guestMap.get(o.guestEmail);
    const spent = o.status === "PAID" ? Number(o.amount) : 0;
    if (existing) {
      existing.orders++;
      existing.spent += spent;
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      guestMap.set(o.guestEmail, { email: o.guestEmail, orders: 1, spent, lastOrder: o.createdAt });
    }
  }

  const guests = Array.from(guestMap.values()).sort((a, b) => b.lastOrder.getTime() - a.lastOrder.getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Users size={22} className="text-purple-400" /> Customers
        <span className="text-sm font-normal text-gray-500 ml-2">({users.length + guests.length})</span>
      </h1>

      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Registered ({users.length})</h2>
      <div className="glass-card overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-right px-4 py-3">Balance</th>
              <th className="text-right px-4 py-3">Orders</th>
              <th className="text-right px-4 py-3">Spent</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-right px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const spent = u.orders.reduce((s: number, o: { amount: { toString(): string } }) => s + Number(o.amount), 0);
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-white text-xs truncate max-w-[200px]">
                    {u.isBanned && <span className="badge-red mr-1 text-xs">BANNED</span>}
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-cyan-400">${Number(u.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-white">{u.orders.length}</td>
                  <td className="px-4 py-3 text-right text-white">${spent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${u.id}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-600 py-10">No registered customers yet.</p>}
      </div>

      {guests.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Guest Customers ({guests.length})</h2>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-right px-4 py-3">Orders</th>
                  <th className="text-right px-4 py-3">Spent</th>
                  <th className="text-left px-4 py-3">Last Order</th>
                  <th className="text-right px-4 py-3">View</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.email} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 text-white text-xs">{g.email}</td>
                    <td className="px-4 py-3 text-right text-white">{g.orders}</td>
                    <td className="px-4 py-3 text-right text-white">${g.spent.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(g.lastOrder).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/customers/${encodeURIComponent(g.email)}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors">
                        <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
