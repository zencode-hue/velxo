import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Handshake } from "lucide-react";
import PartnerActions from "./PartnerActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-green",
  PENDING: "badge-yellow",
  SUSPENDED: "badge-red",
};

export default async function AdminPartnersPage() {
  await requireAdmin();

  const partners = await db.partnerAffiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { referrals: true } },
      payoutRequests: { where: { status: "PENDING" }, select: { id: true } },
    },
  });

  const pendingPayouts = partners.reduce((acc, p) => acc + p.payoutRequests.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Handshake size={22} className="text-green-400" /> Partner Affiliates
          <span className="text-sm font-normal text-gray-500 ml-2">({partners.length})</span>
        </h1>
        {pendingPayouts > 0 && (
          <Link href="/admin/partners/payouts"
            className="text-sm text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 rounded-lg hover:bg-yellow-400/20 transition-colors">
            {pendingPayouts} pending payout{pendingPayouts > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {partners.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Handshake size={40} className="mx-auto mb-4 opacity-20" />
          <p>No partner applications yet.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">Partner</th>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-right px-4 py-3">Referrals</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-right px-4 py-3">Total Earned</th>
                <th className="text-right px-4 py-3">Paid Out</th>
                <th className="text-right px-4 py-3">Commission</th>
                <th className="text-left px-4 py-3">Wallet</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{p.user.name ?? p.user.email}</p>
                    <p className="text-gray-500 text-xs">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400">{p.referralCode}</td>
                  <td className="px-4 py-3 text-right text-white">{p._count.referrals}</td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-medium">${Number(p.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-green-400">${Number(p.totalEarned).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">${Number(p.totalPaidOut).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-white">{Number(p.commissionPct)}%</td>
                  <td className="px-4 py-3">
                    {p.cryptoWallet ? (
                      <div>
                        <span className="text-xs text-purple-400">{p.walletType}</span>
                        <p className="text-xs text-gray-600 font-mono truncate max-w-[100px]">{p.cryptoWallet}</p>
                      </div>
                    ) : <span className="text-gray-600 text-xs">Not set</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={STATUS_BADGE[p.status] ?? "badge-purple"}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PartnerActions partnerId={p.id} currentStatus={p.status} commissionPct={Number(p.commissionPct)} />
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
