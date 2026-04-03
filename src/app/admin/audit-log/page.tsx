import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requireAdmin();

  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Get admin names
  const adminIds = Array.from(new Set(logs.map((l) => l.adminId)));
  const admins = await db.user.findMany({ where: { id: { in: adminIds } }, select: { id: true, email: true } });
  const adminMap = Object.fromEntries(admins.map((a) => [a.id, a.email]));

  const ACTION_COLORS: Record<string, string> = {
    redeliver: "text-blue-400",
    ban: "text-red-400",
    unban: "text-green-400",
    delete: "text-red-400",
    edit: "text-yellow-400",
    balance_credit: "text-cyan-400",
    balance_debit: "text-orange-400",
    status_update: "text-purple-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <ClipboardList size={22} className="text-purple-400" /> Audit Log
      </h1>
      <p className="text-gray-500 text-sm mb-8">All admin actions recorded for accountability.</p>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Admin</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Entity</th>
              <th className="text-left px-4 py-3">Entity ID</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 text-gray-300 text-xs">{adminMap[log.adminId] ?? log.adminId.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium text-xs ${ACTION_COLORS[log.action] ?? "text-gray-400"}`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{log.entityType}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.entityId.slice(0, 16)}…</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-600 py-12">No audit logs yet.</p>}
      </div>
    </div>
  );
}
