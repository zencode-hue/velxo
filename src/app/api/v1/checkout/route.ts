import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sanitizeString } from "@/lib/sanitize";

const DISCORD_SERVER_URL = process.env.DISCORD_SERVER_URL ?? "https://discord.gg/your-server";

const bodySchema = z.object({
  productId: z.string().min(1),
  discountCode: z.string().optional(),
  paymentProvider: z.enum(["nowpayments", "discord"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
    }
    const userId = session.user.id;

    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ data: null, error: "Invalid JSON body", meta: {} }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.errors[0].message, meta: {} }, { status: 400 });
    }

    const { productId, discountCode, paymentProvider } = parsed.data;

    const product = await db.product.findUnique({
      where: { id: sanitizeString(productId), isActive: true },
    });

    if (!product) {
      return NextResponse.json({ data: null, error: "Product not found", meta: {} }, { status: 400 });
    }
    if (product.stockCount <= 0) {
      return NextResponse.json({ data: null, error: "Product is out of stock", meta: {} }, { status: 400 });
    }

    // Discount code validation
    let discountCodeRecord: { id: string; type: "PERCENTAGE" | "FIXED"; value: { toString(): string } } | null = null;
    let discountAmount = 0;

    if (discountCode) {
      const code = await db.discountCode.findUnique({
        where: { code: sanitizeString(discountCode).toUpperCase() },
      });
      if (!code) return NextResponse.json({ data: null, error: "Discount code not found", meta: {} }, { status: 400 });
      if (code.expiresAt < new Date()) return NextResponse.json({ data: null, error: "Discount code has expired", meta: {} }, { status: 400 });
      if (code.usageCount >= code.usageLimit) return NextResponse.json({ data: null, error: "Discount code has reached its usage limit", meta: {} }, { status: 400 });

      const alreadyUsed = await db.discountUsage.findUnique({
        where: { discountCodeId_userId: { discountCodeId: code.id, userId } },
      });
      if (alreadyUsed) return NextResponse.json({ data: null, error: "You have already used this discount code", meta: {} }, { status: 400 });

      discountCodeRecord = code;
      const productPrice = Number(product.price);
      discountAmount = code.type === "PERCENTAGE"
        ? (productPrice * Number(code.value)) / 100
        : Math.min(Number(code.value), productPrice);
    }

    const finalAmount = Math.max(0, Number(product.price) - discountAmount);

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          productId: product.id,
          amount: finalAmount,
          discountAmount,
          status: "PENDING",
          paymentProvider,
          discountCodeId: discountCodeRecord?.id ?? null,
        },
      });

      if (discountCodeRecord) {
        await tx.discountCode.update({ where: { id: discountCodeRecord.id }, data: { usageCount: { increment: 1 } } });
        await tx.discountUsage.create({ data: { discountCodeId: discountCodeRecord.id, userId } });
      }

      return newOrder;
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // NOWPayments — crypto payment
    if (paymentProvider === "nowpayments") {
      const apiKey = process.env.NOWPAYMENTS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ data: null, error: "Crypto payments not configured", meta: {} }, { status: 503 });
      }

      const npRes = await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: finalAmount,
          price_currency: "usd",
          order_id: order.id,
          order_description: product.title,
          ipn_callback_url: `${appUrl}/api/webhooks/nowpayments`,
          success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
          cancel_url: `${appUrl}/checkout/cancel?orderId=${order.id}`,
        }),
      });

      if (!npRes.ok) {
        console.error("[checkout] NOWPayments error:", await npRes.text());
        return NextResponse.json({ data: null, error: "Failed to create crypto payment", meta: {} }, { status: 502 });
      }

      const npData = await npRes.json() as { invoice_url?: string; id?: string };

      await db.order.update({ where: { id: order.id }, data: { paymentRef: String(npData.id ?? "") } });

      return NextResponse.json({ data: { redirectUrl: npData.invoice_url }, error: null, meta: {} });
    }

    // Discord — manual payment redirect
    if (paymentProvider === "discord") {
      const discordMessage = encodeURIComponent(
        `Hi! I want to purchase: ${product.title} ($${finalAmount.toFixed(2)}) — Order ID: ${order.id}`
      );
      const redirectUrl = `${DISCORD_SERVER_URL}?message=${discordMessage}`;

      return NextResponse.json({
        data: {
          redirectUrl,
          orderId: order.id,
          instructions: `Join our Discord server and send your payment details. Quote Order ID: ${order.id}`,
        },
        error: null,
        meta: {},
      });
    }

    return NextResponse.json({ data: null, error: "Invalid payment provider", meta: {} }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/v1/checkout]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
