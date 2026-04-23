import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const payouts = await db.partnerPayoutRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      partnerAffiliate: {
        select: { referralCode: true, user: { select: { email: true, name: true } } },
      },
    },
  });
  return NextResponse.json({ data: payouts, error: null });
}
