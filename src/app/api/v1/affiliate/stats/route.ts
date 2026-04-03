import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { referrals: true } } },
    });

    if (!affiliate) {
      return NextResponse.json(
        { data: null, error: "You are not enrolled in the affiliate program", meta: {} },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return NextResponse.json({
      data: {
        referralCode: affiliate.referralCode,
        referralLink: `${appUrl}/auth/register?ref=${affiliate.referralCode}`,
        totalReferrals: affiliate._count.referrals,
        totalEarned: Number(affiliate.totalEarned),
        pendingPayout: Number(affiliate.pendingPayout),
        commissionPct: Number(affiliate.commissionPct),
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[GET /api/v1/affiliate/stats]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
