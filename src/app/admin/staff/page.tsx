import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Users } from "lucide-react";
import StaffActions from "./StaffActions";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green",
  PENDING: "badge-yellow",
  SUSPENDED: "badge-red",
};

export default async function AdminStaffPage() {
  await requireAdmin();

  const staff = await db.staffMember.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });

  const pending = staff.filter((s) => s.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={22} className="text-blue-400" /> Staff Members
          <span className="text-sm font-normal text-gray-500 ml-2">({staff.length})</span>
          {pending > 0 && (
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              {pending} pending
            </span>
          )}
        </h1>
      </div>

      {staff.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Users size={40} className="mx-auto mb-4 opacity-20" />
          <p>No staff accounts yet. Staff can register at <span className="text-orange-400">/staff-register</span></p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{s.email}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={STATUS_BADGE[s.status] ?? "badge-purple"}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <StaffActions staffId={s.id} currentStatus={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
