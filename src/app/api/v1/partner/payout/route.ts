import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MIN_PAYOUT = 10; // $10 minimum

const schema = z.object({
  amount: z.number().min(MIN_PAYOUT),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const partner = await db.partnerAffiliate.findUnique({ where: { userId: session.user.id } });
  if (!partner) return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
  if (partner.status !== "ACTIVE") return NextResponse.json({ error: "Your partner account is not active" }, { status: 403 });
  if (!partner.cryptoWallet || !partner.walletType) return NextResponse.json({ error: "Please set your crypto wallet first" }, { status: 400 });

  const balance = Number(partner.balance);
  if (parsed.data.amount > balance) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  // Check no pending payout already
  const pending = await db.partnerPayoutRequest.findFirst({
    where: { partnerAffiliateId: partner.id, status: "PENDING" },
  });
  if (pending) return NextResponse.json({ error: "You already have a pending payout request" }, { status: 409 });

  const payout = await db.$transaction(async (tx) => {
    const req = await tx.partnerPayoutRequest.create({
      data: {
        partnerAffiliateId: partner.id,
        amount: parsed.data.amount,
        cryptoWallet: partner.cryptoWallet!,
        walletType: partner.walletType!,
        status: "PENDING",
      },
    });
    // Reserve the balance
    await tx.partnerAffiliate.update({
      where: { id: partner.id },
      data: { balance: { decrement: parsed.data.amount } },
    });
    return req;
  });

  return NextResponse.json({ data: { id: payout.id, status: payout.status }, error: null }, { status: 201 });
}
