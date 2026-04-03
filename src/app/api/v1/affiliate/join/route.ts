import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { randomBytes } from "crypto";

const DEFAULT_COMMISSION_PCT = Number(process.env.AFFILIATE_COMMISSION_PCT ?? "10");

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
    }
    const userId = session.user.id;

    const existing = await db.affiliate.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json(
        { data: { referralCode: existing.referralCode }, error: null, meta: {} }
      );
    }

    // Generate unique 8-char referral code
    let referralCode = "";
    let attempts = 0;
    while (attempts < 10) {
      referralCode = randomBytes(4).toString("hex").toUpperCase();
      const taken = await db.affiliate.findUnique({ where: { referralCode } });
      if (!taken) break;
      attempts++;
    }

    const affiliate = await db.affiliate.create({
      data: { userId, referralCode, commissionPct: DEFAULT_COMMISSION_PCT },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return NextResponse.json(
      {
        data: {
          referralCode: affiliate.referralCode,
          referralLink: `${appUrl}/auth/register?ref=${affiliate.referralCode}`,
          commissionPct: Number(affiliate.commissionPct),
        },
        error: null,
        meta: {},
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/v1/affiliate/join]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
