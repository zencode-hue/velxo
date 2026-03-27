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
        payload: payload as Record<string, unknown>,
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
