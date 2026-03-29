import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sendDiscordNotification } from "@/lib/discord";

const bodySchema = z.object({
  orderId: z.string().min(1),
  giftCardCode: z.string().min(1, "Gift card code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
    }

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
      where: { id: orderId, userId: session.user.id, paymentProvider: "binance_gift_card" },
      include: { product: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ data: null, error: "Order not found", meta: {} }, { status: 404 });
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ data: null, error: "Order already processed", meta: {} }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_GIFT_CARD_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ data: null, error: "Payment method not configured", meta: {} }, { status: 503 });
    }

    await sendDiscordNotification(webhookUrl, {
      embeds: [
        {
          title: "💳 Binance Gift Card Payment Received",
          color: 0xf0b90b, // Binance yellow
          fields: [
            { name: "Order ID", value: orderId, inline: true },
            { name: "Amount", value: `$${Number(order.amount).toFixed(2)} USD`, inline: true },
            { name: "Product", value: order.product.title, inline: false },
            { name: "Customer", value: `${order.user.name ?? "N/A"} (${order.user.email})`, inline: false },
            { name: "Gift Card Code", value: `\`\`\`${giftCardCode}\`\`\``, inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Verify and mark order as PAID after redeeming the gift card" },
        },
      ],
    });

    // Mark order as pending stock — admin will verify and fulfill
    await db.order.update({
      where: { id: orderId },
      data: { status: "PENDING_STOCK", paymentRef: `gift_card:${giftCardCode.slice(0, 8)}***` },
    });

    return NextResponse.json({
      data: { message: "Gift card code submitted successfully. Your order will be processed shortly." },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[POST /api/v1/checkout/binance-gift-card]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
