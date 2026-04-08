import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staff-auth";
import { retryDelivery } from "@/lib/delivery";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  // Only allow redeliver on PAID orders with no delivery log
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { deliveryLog: { select: { id: true } } },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "PAID") return NextResponse.json({ error: "Order is not PAID" }, { status: 400 });
  if (order.deliveryLog) return NextResponse.json({ error: "Already delivered" }, { status: 400 });

  try {
    await retryDelivery(orderId);
    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    console.error("[staff/redeliver]", err);
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
  }
}
