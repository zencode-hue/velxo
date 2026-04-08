import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import PayoutActions from "./PayoutActions";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-yellow",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const payouts = await db.partnerPayoutRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      partnerAffiliate: {
        select: { referralCode: true, user: { select: { email: true, name: true } } },
      },
    },
  });

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/partners" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet size={22} className="text-yellow-400" /> Payout Requests
          </h1>
          {pendingTotal > 0 && (
            <p className="text-sm text-yellow-400 mt-1">${pendingTotal.toFixed(2)} pending across {payouts.filter((p) => p.status === "PENDING").length} request(s)</p>
          )}
        </div>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-4 py-3">Partner</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Wallet</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">TX Hash</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{p.partnerAffiliate.user.name ?? p.partnerAffiliate.user.email}</p>
                  <p className="text-gray-500 text-xs">{p.partnerAffiliate.user.email}</p>
                </td>
                <td className="px-4 py-3 text-right text-white font-bold">${Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-purple-400">{p.walletType}</span>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]">{p.cryptoWallet}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={STATUS_BADGE[p.status] ?? "badge-purple"}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[100px]">
                  {p.txHash ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {p.status === "PENDING" && <PayoutActions payoutId={p.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payouts.length === 0 && <p className="text-center text-gray-600 py-12">No payout requests yet.</p>}
      </div>
    </div>
  );
}
