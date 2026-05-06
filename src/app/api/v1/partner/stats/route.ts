import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partner = await db.partnerAffiliate.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { referrals: true } },
      payoutRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, amount: true, status: true, createdAt: true, txHash: true, walletType: true },
      },
    },
  });

  if (!partner) return NextResponse.json({ data: null, error: null });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

  return NextResponse.json({
    data: {
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
      status: partner.status,
      payoutRequests: partner.payoutRequests.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    },
    error: null,
  });
}
