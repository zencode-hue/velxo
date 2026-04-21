import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json({ error: "orderId and email required" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      OR: [
        { user: { email } },
        { guestEmail: email },
      ],
    },
    select: { id: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ data: { found: false }, error: null });
  }

  return NextResponse.json({ data: { found: true, status: order.status }, error: null });
}
