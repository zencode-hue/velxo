import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  cryptoWallet: z.string().min(10).max(200),
  walletType: z.enum(["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "BNB"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const partner = await db.partnerAffiliate.findUnique({ where: { userId: session.user.id } });
  if (!partner) return NextResponse.json({ error: "Partner account not found" }, { status: 404 });

  await db.partnerAffiliate.update({
    where: { id: partner.id },
    data: { cryptoWallet: parsed.data.cryptoWallet, walletType: parsed.data.walletType },
  });

  return NextResponse.json({ data: { message: "Wallet updated" }, error: null });
}
