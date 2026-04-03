import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Webhook } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WebhookLogsPage() {
  await requireAdmin();

  const logs = await db.webhookLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Webhook size={22} className="text-purple-400" /> Webhook Logs
      </h1>
      <p className="text-gray-500 text-sm mb-8">Last 100 incoming webhook events from payment providers.</p>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-xs min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 uppercase">
              <th className="text-left px-4 py-3">Provider</th>
              <th className="text-left px-4 py-3">Event</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Payload Preview</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-medium text-white capitalize">{log.provider}</td>
                <td className="px-4 py-3 font-mono text-purple-300">{log.eventType}</td>
                <td className="px-4 py-3 text-center">
                  <span className={log.status === "processed" ? "badge-green" : "badge-red"}>{log.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[300px] font-mono">
                  {JSON.stringify(log.payload).slice(0, 80)}…
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-600 py-12">No webhook logs yet.</p>}
      </div>
    </div>
  );
}
