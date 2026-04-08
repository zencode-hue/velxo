import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  cryptoWallet: z.string().min(10).max(200),
  walletType: z.enum(["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "BNB"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await db.partnerAffiliate.findUnique({ where: { userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "You already have a partner application." }, { status: 409 });

  let referralCode = "";
  for (let i = 0; i < 10; i++) {
    const code = "P" + randomBytes(4).toString("hex").toUpperCase();
    const taken = await db.partnerAffiliate.findUnique({ where: { referralCode: code } });
    if (!taken) { referralCode = code; break; }
  }

  const partner = await db.partnerAffiliate.create({
    data: {
      userId: session.user.id,
      referralCode,
      cryptoWallet: parsed.data.cryptoWallet,
      walletType: parsed.data.walletType,
      status: "PENDING",
    },
  });

  return NextResponse.json({ data: { id: partner.id, status: partner.status }, error: null }, { status: 201 });
}
