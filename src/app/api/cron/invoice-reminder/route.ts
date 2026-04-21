import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendInvoiceReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Cron: runs every ~10 minutes.
 * Finds PENDING orders created 25–35 minutes ago (the 30-min window)
 * that haven't had a reminder sent yet, and emails the customer.
 *
 * Schedule on Vercel: */10 * * * *
 * Protect with CRON_SECRET header.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - 35 * 60 * 1000); // 35 min ago
  const windowEnd = new Date(now.getTime() - 25 * 60 * 1000);   // 25 min ago

  // Find PENDING orders in the 25–35 min window
  const pendingOrders = await db.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { gte: windowStart, lte: windowEnd },
    },
    include: {
      product: { select: { title: true } },
      user: { select: { email: true } },
    },
    take: 100,
  });

  let sent = 0;
  let failed = 0;

  for (const order of pendingOrders) {
    const email = order.user?.email ?? (order as { guestEmail?: string | null }).guestEmail;
    if (!email) continue;

    try {
      await sendInvoiceReminderEmail(
        email,
        order.id,
        order.product.title,
        Number(order.amount)
      );
      sent++;
    } catch (err) {
      console.error(`[invoice-reminder] Failed for order ${order.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    data: { processed: pendingOrders.length, sent, failed },
    error: null,
  });
}
