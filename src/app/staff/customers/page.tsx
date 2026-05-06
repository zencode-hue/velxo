import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffCustomersPage() {
  await requireStaff();

  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, name: true, email: true, createdAt: true, isBanned: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Users size={22} className="text-amber-400" /> Customers
        <span className="text-sm font-normal text-gray-500 ml-2">({customers.length})</span>
      </h1>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-center px-5 py-3">Orders</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-5 py-3 text-white">{c.name ?? "—"}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{c.email}</td>
                <td className="px-5 py-3 text-center text-white">{c._count.orders}</td>
                <td className="px-5 py-3 text-center">
                  <span className={c.isBanned ? "badge-red" : "badge-green"}>
                    {c.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center text-gray-600 py-12">No customers yet.</p>}
      </div>
    </div>
  );
}
