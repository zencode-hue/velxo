import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const payouts = await db.partnerPayoutRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        partnerAffiliate: {
          select: { referralCode: true, user: { select: { email: true, name: true } } },
        },
      },
    });
    return NextResponse.json({ data: payouts, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
