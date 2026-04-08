import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staff-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { title: true } },
      deliveryLog: { select: { id: true } },
    },
  });

  return NextResponse.json({ data: orders, error: null });
}
