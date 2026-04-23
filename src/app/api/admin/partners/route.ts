import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const partners = await db.partnerAffiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { referrals: true } },
      payoutRequests: { where: { status: "PENDING" }, select: { id: true } },
    },
  });
  return NextResponse.json({ data: partners, error: null });
}
