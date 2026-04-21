import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayOrders, totalOrders, totalCustomers] = await Promise.all([
      db.order.count({ where: { status: "PAID", createdAt: { gte: todayStart } } }),
      db.order.count({ where: { status: "PAID" } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    return NextResponse.json({
      data: { todayOrders, totalOrders, totalCustomers },
      error: null,
    });
  } catch {
    return NextResponse.json({ data: { todayOrders: 0, totalOrders: 0, totalCustomers: 0 }, error: null });
  }
}
