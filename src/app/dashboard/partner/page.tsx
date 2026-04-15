import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Handshake } from "lucide-react";
import PartnerDashboard from "./PartnerDashboard";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const partner = await db.partnerAffiliate.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { referrals: true } },
      payoutRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, amount: true, status: true, createdAt: true, txHash: true, walletType: true, cryptoWallet: true, adminNote: true },
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Handshake size={22} className="text-green-400" /> Partner Program
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Earn real cash commissions. Withdraw to your crypto wallet anytime.
      </p>

      <PartnerDashboard
        partner={partner ? {
          id: partner.id,
          referralCode: partner.referralCode,
          referralLink: `${appUrl}/auth/register?pref=${partner.referralCode}`,
          commissionPct: Number(partner.commissionPct),
          balance: Number(partner.balance),
          totalEarned: Number(partner.totalEarned),
          totalPaidOut: Number(partner.totalPaidOut),
          totalReferrals: partner._count.referrals,
          cryptoWallet: partner.cryptoWallet,
          walletType: partner.walletType,
          status: String(partner.status),
          payoutRequests: partner.payoutRequests.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            status: String(p.status),
            createdAt: p.createdAt.toISOString(),
            txHash: p.txHash ?? null,
            walletType: p.walletType,
            cryptoWallet: p.cryptoWallet,
            adminNote: p.adminNote ?? null,
          })),
        } : null}
      />
    </div>
  );
}
