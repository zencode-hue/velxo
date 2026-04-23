import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  txHash: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const payout = await db.partnerPayoutRequest.findUnique({ where: { id: params.id } });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payout.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 400 });

  if (parsed.data.action === "approve") {
    await db.$transaction(async (tx) => {
      await tx.partnerPayoutRequest.update({
        where: { id: params.id },
        data: { status: "APPROVED", txHash: parsed.data.txHash, adminNote: parsed.data.adminNote },
      });
      await tx.partnerAffiliate.update({
        where: { id: payout.partnerAffiliateId },
        data: { totalPaidOut: { increment: Number(payout.amount) } },
      });
    });

    const partner = await db.partnerAffiliate.findUnique({
      where: { id: payout.partnerAffiliateId },
      include: { user: { select: { email: true } } },
    });
    if (partner?.user?.email) {
      const { send: sendEmail } = await import("@/lib/email").then(m => ({ send: m.sendPayoutNotificationEmail })).catch(() => ({ send: null }));
      if (sendEmail) await sendEmail(partner.user.email, "approved", Number(payout.amount), parsed.data.txHash).catch(() => {});
    }
  } else {
    await db.$transaction(async (tx) => {
      await tx.partnerPayoutRequest.update({
        where: { id: params.id },
        data: { status: "REJECTED", adminNote: parsed.data.adminNote },
      });
      await tx.partnerAffiliate.update({
        where: { id: payout.partnerAffiliateId },
        data: { balance: { increment: Number(payout.amount) } },
      });
    });
  }

  return NextResponse.json({ data: { success: true }, error: null });
}
