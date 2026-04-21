import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sanitizeString } from "@/lib/sanitize";
import { sendInvoiceCreatedEmail } from "@/lib/email";

const DISCORD_SERVER_URL = process.env.DISCORD_SERVER_URL ?? "https://discord.gg/your-server";

const bodySchema = z.object({
  productId: z.string().min(1),
  discountCode: z.string().optional(),
  paymentProvider: z.enum(["nowpayments", "discord", "balance", "binance_gift_card", "flutterwave"]),
  guestEmail: z.string().email().optional(),
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

    const { productId, discountCode, paymentProvider, guestEmail } = parsed.data;

    // Must have either a session or a guest email
    const userId = session?.user?.id ?? null;
    const deliveryEmail = userId
      ? session!.user.email!
      : guestEmail ?? null;

    if (!userId && !guestEmail) {
      return NextResponse.json({ data: null, error: "Please provide your email to continue as guest", meta: {} }, { status: 401 });
    }

    // Balance payment requires a logged-in user
    if (paymentProvider === "balance" && !userId) {
      return NextResponse.json({ data: null, error: "Sign in to pay with balance", meta: {} }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (db.product.findFirst as any)({
      where: { id: sanitizeString(productId), isActive: true },
    }) as ({ unlimitedStock: boolean; stockCount: number; id: string; title: string; price: { toString(): string }; } | null);

    if (!product) {
      return NextResponse.json({ data: null, error: "Product not found", meta: {} }, { status: 400 });
    }
    if (!product.unlimitedStock && product.stockCount <= 0) {
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

      // Only check per-user discount usage for logged-in users
      if (userId) {
        const alreadyUsed = await db.discountUsage.findUnique({
          where: { discountCodeId_userId: { discountCodeId: code.id, userId } },
        });
        if (alreadyUsed) return NextResponse.json({ data: null, error: "You have already used this discount code", meta: {} }, { status: 400 });
      }

      discountCodeRecord = code;
      const productPrice = Number(product.price);
      discountAmount = code.type === "PERCENTAGE"
        ? (productPrice * Number(code.value)) / 100
        : Math.min(Number(code.value), productPrice);
    }

    const finalAmount = Math.max(0, Number(product.price) - discountAmount);

    // Balance payment — deduct immediately
    if (paymentProvider === "balance") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await (db.user.findUnique as any)({ where: { id: userId }, select: { balance: true } }) as { balance: { toString(): string } } | null;
      if (!user) return NextResponse.json({ data: null, error: "User not found", meta: {} }, { status: 400 });
      if (Number(user.balance) < finalAmount) {
        return NextResponse.json({ data: null, error: "Insufficient balance", meta: {} }, { status: 400 });
      }

      const order = await db.$transaction(async (tx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newOrder = await (tx.order.create as any)({
          data: {
            userId: userId ?? undefined,
            productId: product.id,
            amount: finalAmount,
            discountAmount,
            status: "PAID",
            paymentProvider: "balance",
            discountCodeId: discountCodeRecord?.id ?? null,
          },
        });

        // Deduct balance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx.user.update as any)({
          where: { id: userId },
          data: { balance: { decrement: finalAmount } },
        });

        // Record transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).balanceTransaction.create({
          data: {
            userId,
            type: "PURCHASE",
            amount: -finalAmount,
            description: `Purchase: ${product.title}`,
            orderId: newOrder.id,
          },
        });

        if (discountCodeRecord) {
          await tx.discountCode.update({ where: { id: discountCodeRecord.id }, data: { usageCount: { increment: 1 } } });
          if (userId) await tx.discountUsage.create({ data: { discountCodeId: discountCodeRecord.id, userId } });
        }

        return newOrder;
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.json({
        data: { redirectUrl: `${appUrl}/checkout/success?orderId=${order.id}`, orderId: order.id },
        error: null,
        meta: {},
      });
    }

    const order = await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newOrder = await (tx.order.create as any)({
        data: {
          userId: userId ?? undefined,
          guestEmail: userId ? null : (guestEmail ?? null),
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
        if (userId) await tx.discountUsage.create({ data: { discountCodeId: discountCodeRecord.id, userId } });
      }

      return newOrder;
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Send invoice created email immediately (non-blocking)
    if (deliveryEmail) {
      sendInvoiceCreatedEmail(
        deliveryEmail,
        order.id,
        product.title,
        finalAmount,
        paymentProvider
      ).catch((e) => console.error("[checkout] invoice email failed:", e));
    }

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
          success_url: `${appUrl}/checkout/success?orderId=${order.id}${!userId ? `&email=${encodeURIComponent(deliveryEmail ?? "")}` : ""}`,
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

    if (paymentProvider === "discord") {
      const discordMessage = encodeURIComponent(
        `Hi! I want to purchase: ${product.title} ($${finalAmount.toFixed(2)}) — Order ID: ${order.id}`
      );
      const redirectUrl = `${DISCORD_SERVER_URL}?message=${discordMessage}`;
      return NextResponse.json({
        data: { redirectUrl, orderId: order.id, instructions: `Join our Discord server and send your payment details. Quote Order ID: ${order.id}` },
        error: null,
        meta: {},
      });
    }

    if (paymentProvider === "binance_gift_card") {
      // Map the final amount to the nearest Eneba Binance gift card denomination
      const denominations = [
        0.5, 1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 14, 15,
        17, 18, 20, 20.5, 22, 25, 27, 28, 29, 30, 33, 33.5, 35, 40, 43, 43.5,
        44, 44.5, 45, 45.5, 46, 50, 50.5, 55, 60, 65, 66, 70, 100, 150, 200,
        250, 300, 400, 500, 750,
      ];

      // Find the smallest denomination >= finalAmount
      const denomination = denominations.find((d) => d >= finalAmount) ?? finalAmount;

      // Format: 0.5 → "0-5", 7.5 → "7-5", 25 → "25"
      const denomStr = denomination % 1 === 0
        ? String(denomination)
        : denomination.toFixed(1).replace(".", "-");

      const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      return NextResponse.json({
        data: {
          redirectUrl: enebaUrl,
          orderId: order.id,
          denomination,
          codeSubmitUrl: `${appUrl}/checkout/gift-card?orderId=${order.id}&amount=${denomination}`,
        },
        error: null,
        meta: {},
      });
    }

    if (paymentProvider === "flutterwave") {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json({ data: null, error: "Card payments not configured", meta: {} }, { status: 503 });
      }

      const fwRes = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_ref: order.id,
          amount: finalAmount,
          currency: "USD",
          redirect_url: `${appUrl}/api/webhooks/flutterwave?orderId=${order.id}`,
          customer: { email: deliveryEmail ?? "guest@checkout.com" },
          meta: { orderId: order.id },
          customizations: {
            title: product.title,
            description: `Purchase: ${product.title}`,
          },
        }),
      });

      if (!fwRes.ok) {
        console.error("[checkout] Flutterwave error:", await fwRes.text());
        return NextResponse.json({ data: null, error: "Failed to create card payment", meta: {} }, { status: 502 });
      }

      const fwData = await fwRes.json() as { data?: { link?: string } };
      await db.order.update({ where: { id: order.id }, data: { paymentRef: order.id } });
      return NextResponse.json({ data: { redirectUrl: fwData.data?.link }, error: null, meta: {} });
    }

    return NextResponse.json({ data: null, error: "Invalid payment provider", meta: {} }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/v1/checkout]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
