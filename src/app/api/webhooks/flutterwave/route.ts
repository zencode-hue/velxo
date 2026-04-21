import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { deliverOrder } from "@/lib/delivery";

export const dynamic = "force-dynamic";

/**
 * Flutterwave sends a redirect GET after payment (with tx_ref, transaction_id, status)
 * AND a POST webhook for server-side verification.
 * We handle both here.
 */

// Verify Flutterwave webhook signature
function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret) return false;
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function verifyAndFulfill(transactionId: string, expectedRef: string) {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("Flutterwave not configured");

  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) throw new Error("Failed to verify transaction");

  const data = await res.json() as {
    status: string;
    data?: { status: string; tx_ref: string; amount: number; currency: string };
  };

  if (data.status !== "success" || data.data?.status !== "successful") return false;
  if (data.data.tx_ref !== expectedRef) return false;

  return { amount: data.data.amount, currency: data.data.currency };
}

// POST — server-side webhook from Flutterwave
export async function POST(req: NextRequest) {
  let rawBody: string;
  try { rawBody = await req.text(); } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const signature = req.headers.get("verif-hash");
  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const event = payload.event as string | undefined;
  const txRef = (payload.data as Record<string, unknown>)?.tx_ref as string | undefined;
  const transactionId = String((payload.data as Record<string, unknown>)?.id ?? "");

  let logStatus = "processed";

  try {
    if (event === "charge.completed" && txRef && transactionId) {
      await processFlutterwavePayment(txRef, transactionId);
    }
  } catch (err) {
    console.error("[Flutterwave Webhook] Processing error:", err);
    logStatus = "failed";
  }

  await db.webhookLog.create({
    data: {
      provider: "flutterwave",
      eventType: event ?? "unknown",
      payload: payload as import("@prisma/client").Prisma.InputJsonValue,
      status: logStatus,
    },
  }).catch((e) => console.error("[Flutterwave Webhook] Failed to write log:", e));

  return NextResponse.json({ received: true }, { status: 200 });
}

// GET — redirect callback after payment
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");
  const orderId = searchParams.get("orderId");
  const topupRef = searchParams.get("topupRef");
  const userId = searchParams.get("userId");
  const amount = searchParams.get("amount");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (status !== "successful" || !txRef || !transactionId) {
    return NextResponse.redirect(`${appUrl}/checkout?error=payment_failed`);
  }

  try {
    const verified = await verifyAndFulfill(transactionId, txRef);
    if (!verified) {
      return NextResponse.redirect(`${appUrl}/checkout?error=verification_failed`);
    }

    // Balance top-up
    if (topupRef && userId && amount) {
      const alreadyProcessed = await db.webhookLog.findFirst({
        where: { provider: "flutterwave", eventType: "topup_credited", payload: { path: ["ref"], equals: topupRef } },
      });

      if (!alreadyProcessed) {
        const topupAmount = parseFloat(amount);
        await db.$transaction(async (tx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tx.user.update as any)({ where: { id: userId }, data: { balance: { increment: topupAmount } } });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tx as any).balanceTransaction.create({
            data: { userId, type: "TOPUP", amount: topupAmount, description: `Balance top-up via card (ref: ${topupRef})` },
          });
        });

        await db.webhookLog.create({
          data: {
            provider: "flutterwave",
            eventType: "topup_credited",
            payload: { ref: topupRef, userId, amount: topupAmount } as import("@prisma/client").Prisma.InputJsonValue,
            status: "processed",
          },
        });
      }

      return NextResponse.redirect(`${appUrl}/dashboard?topup=success`);
    }

    // Order payment
    if (orderId) {
      const order = await db.order.findFirst({ where: { id: orderId, paymentProvider: "flutterwave" } });
      if (order && order.status !== "PAID") {
        await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });
        await deliverOrder(orderId);
      }
      return NextResponse.redirect(`${appUrl}/checkout/success?orderId=${orderId}`);
    }
  } catch (err) {
    console.error("[Flutterwave Redirect] Error:", err);
  }

  return NextResponse.redirect(`${appUrl}/checkout?error=unknown`);
}

async function processFlutterwavePayment(txRef: string, transactionId: string) {
  const verified = await verifyAndFulfill(transactionId, txRef);
  if (!verified) return;

  // Top-up ref
  if (txRef.startsWith("TOPUP-")) {
    const parts = txRef.split("-");
    const userId = parts.slice(1, -1).join("-");
    if (!userId) return;

    const alreadyProcessed = await db.webhookLog.findFirst({
      where: { provider: "flutterwave", eventType: "topup_credited", payload: { path: ["ref"], equals: txRef } },
    });
    if (alreadyProcessed) return;

    await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx.user.update as any)({ where: { id: userId }, data: { balance: { increment: verified.amount } } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).balanceTransaction.create({
        data: { userId, type: "TOPUP", amount: verified.amount, description: `Balance top-up via card (ref: ${txRef})` },
      });
    });

    await db.webhookLog.create({
      data: {
        provider: "flutterwave",
        eventType: "topup_credited",
        payload: { ref: txRef, userId, amount: verified.amount } as import("@prisma/client").Prisma.InputJsonValue,
        status: "processed",
      },
    });
    return;
  }

  // Order
  const order = await db.order.findFirst({ where: { id: txRef, paymentProvider: "flutterwave" } });
  if (!order || order.status === "PAID") return;

  await db.order.update({ where: { id: txRef }, data: { status: "PAID" } });
  await deliverOrder(txRef);
}
