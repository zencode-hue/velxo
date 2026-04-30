import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { deliverOrder } from "@/lib/delivery";

export const dynamic = "force-dynamic";

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;

/**
 * Verify NOWPayments HMAC-SHA512 signature.
 * The signature is computed over the sorted JSON body using the IPN secret.
 */
function verifyNowPaymentsSignature(rawBody: string, signature: string): boolean {
  try {
    const parsed = JSON.parse(rawBody);
    // Sort keys alphabetically and re-serialize
    const sorted = sortObjectKeys(parsed);
    const sortedJson = JSON.stringify(sorted);
    const expected = crypto
      .createHmac("sha512", IPN_SECRET)
      .update(sortedJson)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortObjectKeys(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, unknown>, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const signature = req.headers.get("x-nowpayments-sig");
  if (!signature) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (!verifyNowPaymentsSignature(rawBody, signature)) {
    console.error("[NOWPayments Webhook] Invalid signature");
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const paymentStatus = payload.payment_status as string | undefined;
  const paymentId = payload.payment_id as string | undefined;
  const orderId = (payload.order_id ?? payload.order_description) as string | undefined;

  let logStatus = "processed";

  try {
    await processNowPaymentsEvent(paymentStatus, orderId, paymentId);
  } catch (err) {
    console.error("[NOWPayments Webhook] Processing error:", err);
    logStatus = "failed";
  }

  try {
    await db.webhookLog.create({
      data: {
        provider: "nowpayments",
        eventType: paymentStatus ?? "unknown",
        payload: payload as import("@prisma/client").Prisma.InputJsonValue,
        status: logStatus,
      },
    });
  } catch (err) {
    console.error("[NOWPayments Webhook] Failed to write WebhookLog:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processNowPaymentsEvent(
  paymentStatus: string | undefined,
  orderId: string | undefined,
  paymentId: string | undefined
) {
  if (!orderId) {
    console.warn("[NOWPayments Webhook] Missing order reference");
    return;
  }

  // Handle balance top-up payments (order_id starts with "TOPUP-")
  if (orderId.startsWith("TOPUP-")) {
    if (paymentStatus === "finished") {
      await processTopupPayment(orderId, paymentId);
    }
    return;
  }

  // Handle cart checkout (order_id starts with "cart_")
  if (orderId.startsWith("cart_")) {
    if (paymentStatus === "finished") {
      await processCartPayment(orderId, paymentId);
    } else if (paymentStatus === "failed" || paymentStatus === "expired") {
      await db.order.updateMany({
        where: { adminNote: orderId, paymentProvider: "nowpayments" },
        data: { status: "FAILED" },
      });
    }
    return;
  }

  // Find order by paymentRef or id
  const order = await db.order.findFirst({
    where: {
      OR: [
        { id: orderId },
        { paymentRef: paymentId ?? orderId },
      ],
      paymentProvider: "nowpayments",
    },
  });

  if (!order) {
    console.warn(`[NOWPayments Webhook] Order not found for ref: ${orderId}`);
    return;
  }

  if (paymentStatus === "finished") {
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await deliverOrder(order.id);
  } else if (paymentStatus === "failed" || paymentStatus === "expired") {
    await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
  }
}

/**
 * Delivers all orders in a cart group when crypto payment confirms.
 */
async function processCartPayment(cartGroupId: string, paymentId: string | undefined): Promise<void> {
  const orders = await db.order.findMany({
    where: { adminNote: cartGroupId, paymentProvider: "nowpayments", status: "PENDING" },
    select: { id: true },
  });

  if (orders.length === 0) {
    console.warn(`[NOWPayments Webhook] No pending orders for cart group: ${cartGroupId}`);
    return;
  }

  for (const order of orders) {
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    try {
      await deliverOrder(order.id);
    } catch (err) {
      console.error(`[NOWPayments Webhook] Cart delivery failed for order ${order.id}:`, err);
    }
  }
}

/**
 * Credits a user's balance after a successful NOWPayments top-up.
 * topupRef format: TOPUP-{userId}-{timestamp}
 */
async function processTopupPayment(topupRef: string, paymentId: string | undefined): Promise<void> {
  // Parse userId and amount from the ref — ref is TOPUP-{userId}-{timestamp}
  // Amount is stored in the NOWPayments payload as price_amount, but we need to
  // look it up from the webhook log or re-derive it. Instead we store a pending
  // topup record. Since we don't have a TopupRequest table, we use the
  // WebhookLog to detect duplicates and fetch the amount from NOWPayments API.
  const parts = topupRef.split("-");
  // TOPUP-{cuid}-{timestamp} — cuid can contain hyphens, so userId is everything between first and last segment
  const userId = parts.slice(1, -1).join("-");
  if (!userId) {
    console.warn(`[NOWPayments Webhook] Could not parse userId from topupRef: ${topupRef}`);
    return;
  }

  // Idempotency: check if this topupRef was already processed
  const alreadyProcessed = await db.webhookLog.findFirst({
    where: { provider: "nowpayments", eventType: "topup_credited", payload: { path: ["ref"], equals: topupRef } },
  });
  if (alreadyProcessed) {
    console.log(`[NOWPayments Webhook] Topup already processed: ${topupRef}`);
    return;
  }

  // Fetch payment details from NOWPayments to get the actual amount
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  let amount = 0;

  if (apiKey && paymentId) {
    try {
      const res = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        headers: { "x-api-key": apiKey },
      });
      if (res.ok) {
        const data = await res.json() as { price_amount?: number };
        amount = Number(data.price_amount ?? 0);
      }
    } catch (err) {
      console.error("[NOWPayments Webhook] Failed to fetch payment details:", err);
    }
  }

  if (amount <= 0) {
    console.warn(`[NOWPayments Webhook] Could not determine topup amount for ref: ${topupRef}`);
    return;
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    console.warn(`[NOWPayments Webhook] User not found for topup: ${userId}`);
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx as any).balanceTransaction.create({
      data: {
        userId,
        type: "TOPUP",
        amount,
        description: `Balance top-up via NOWPayments (ref: ${topupRef})`,
      },
    });
  });

  // Log as processed for idempotency
  await db.webhookLog.create({
    data: {
      provider: "nowpayments",
      eventType: "topup_credited",
      payload: { ref: topupRef, userId, amount } as import("@prisma/client").Prisma.InputJsonValue,
      status: "processed",
    },
  });

  console.log(`[NOWPayments Webhook] Topup credited: ${amount} USD to user ${userId}`);
}
