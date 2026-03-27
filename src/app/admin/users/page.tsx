import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      orders: { where: { status: "PAID" }, select: { amount: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Users size={22} className="text-purple-400" /> Users
      </h1>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-center px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Orders</th>
              <th className="text-right px-4 py-3">Total Spend</th>
              <th className="text-left px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const totalSpend = u.orders.reduce((s, o) => s + Number(o.amount), 0);
              return (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white truncate max-w-[200px]">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={u.role === "ADMIN" ? "badge-purple" : "badge-green"}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{u.orders.length}</td>
                  <td className="px-4 py-3 text-right text-white">${totalSpend.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-600 py-12">No users yet.</p>}
      </div>
    </div>
  );
}
