import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { UserCheck } from "lucide-react";

export default async function AdminAffiliatesPage() {
  await requireAdmin();

  const affiliates = await db.affiliate.findMany({
    orderBy: { totalEarned: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { referrals: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <UserCheck size={22} className="text-purple-400" /> Affiliates
      </h1>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Referral Code</th>
              <th className="text-right px-4 py-3">Referrals</th>
              <th className="text-right px-4 py-3">Total Earned</th>
              <th className="text-right px-4 py-3">Pending Payout</th>
              <th className="text-right px-4 py-3">Commission %</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 text-white">{a.user.email}</td>
                <td className="px-4 py-3 font-mono text-purple-300">{a.referralCode}</td>
                <td className="px-4 py-3 text-right text-white">{a._count.referrals}</td>
                <td className="px-4 py-3 text-right text-green-400">${Number(a.totalEarned).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-yellow-400">${Number(a.pendingPayout).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-400">{Number(a.commissionPct)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {affiliates.length === 0 && <p className="text-center text-gray-600 py-12">No affiliates yet.</p>}
      </div>
    </div>
  );
}
