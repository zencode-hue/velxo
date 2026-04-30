import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sendDiscordNotification } from "@/lib/discord";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  orderId: z.string().min(1),
  giftCardCode: z.string().min(1, "Gift card code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ data: null, error: "Invalid JSON body", meta: {} }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.errors[0].message, meta: {} }, { status: 400 });
    }

    const { orderId, giftCardCode } = parsed.data;

    const order = await db.order.findFirst({
      where: { id: orderId, paymentProvider: "binance_gift_card" },
      include: { product: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ data: null, error: "Order not found", meta: {} }, { status: 404 });
    }

    const isOwner = session?.user?.id ? order.userId === session.user.id : true;
    if (!isOwner) {
      return NextResponse.json({ data: null, error: "Order not found", meta: {} }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ data: null, error: "Order already processed", meta: {} }, { status: 400 });
    }

    const deliveryEmail = order.user?.email ?? (order as { guestEmail?: string | null }).guestEmail ?? null;

    const webhookUrl = process.env.DISCORD_GIFT_CARD_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ data: null, error: "Payment method not configured", meta: {} }, { status: 503 });
    }

    // Check if this is a cart group order
    const cartGroupId = (order as { adminNote?: string | null }).adminNote;
    const isCartOrder = cartGroupId?.startsWith("cart_gc_");

    let allOrderIds = [orderId];
    let totalAmount = Number(order.amount);
    let productSummary = order.product.title;

    if (isCartOrder && cartGroupId) {
      const cartOrders = await db.order.findMany({
        where: { adminNote: cartGroupId, paymentProvider: "binance_gift_card" },
        include: { product: { select: { title: true } } },
      });
      allOrderIds = cartOrders.map((o) => o.id);
      totalAmount = cartOrders.reduce((s, o) => s + Number(o.amount), 0);
      productSummary = cartOrders.map((o) => o.product.title).join(", ");
    }

    await sendDiscordNotification(webhookUrl, {
      embeds: [{
        title: "💳 Binance Gift Card Payment Received",
        color: 0xf0b90b,
        fields: [
          { name: isCartOrder ? "Cart Group" : "Order ID", value: isCartOrder ? cartGroupId! : orderId, inline: true },
          { name: "Amount", value: `$${totalAmount.toFixed(2)} USD`, inline: true },
          { name: "Products", value: productSummary.slice(0, 200), inline: false },
          { name: "Customer", value: deliveryEmail ?? "Guest", inline: false },
          { name: "Gift Card Code", value: `\`\`\`${giftCardCode}\`\`\``, inline: false },
          ...(isCartOrder ? [{ name: "Order IDs", value: allOrderIds.join("\n"), inline: false }] : []),
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "Verify and mark ALL orders as PAID after redeeming the gift card" },
      }],
    });

    // Mark all orders as PENDING_STOCK
    for (const oid of allOrderIds) {
      await db.order.update({
        where: { id: oid },
        data: { status: "PENDING_STOCK", paymentRef: `gift_card:${giftCardCode.slice(0, 8)}***` },
      });
    }

    return NextResponse.json({
      data: { message: "Gift card code submitted. Your order will be processed shortly." },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[POST /api/v1/checkout/binance-gift-card]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
