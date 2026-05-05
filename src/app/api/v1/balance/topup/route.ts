import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const bodySchema = z.object({
  amount: z.number().min(1).max(500),
  paymentProvider: z.enum(["nowpayments", "discord", "binance_gift_card", "flutterwave"]),
});

export async function POST(req: NextRequest) {
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

  const { amount, paymentProvider } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";
  const topupRef = `TOPUP-${session.user.id}-${Date.now()}`;

  if (paymentProvider === "nowpayments") {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ data: null, error: "Crypto payments not configured", meta: {} }, { status: 503 });
    }

    const npRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        order_id: topupRef,
        order_description: `MetraMart Balance Top-Up $${amount}`,
        ipn_callback_url: `${appUrl}/api/webhooks/nowpayments`,
        success_url: `${appUrl}/dashboard?topup=success`,
        cancel_url: `${appUrl}/dashboard?topup=cancelled`,
      }),
    });

    if (!npRes.ok) {
      return NextResponse.json({ data: null, error: "Failed to create payment", meta: {} }, { status: 502 });
    }

    const npData = await npRes.json() as { invoice_url?: string; id?: string };
    return NextResponse.json({ data: { redirectUrl: npData.invoice_url, ref: topupRef }, error: null, meta: {} });
  }

  if (paymentProvider === "binance_gift_card") {
    const denominations = [1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 14, 15, 17, 18, 20, 20.5, 22, 25, 27, 28, 29, 30, 33, 33.5, 35, 40, 43, 43.5, 44, 44.5, 45, 45.5, 46, 50, 50.5, 55, 60, 65, 66, 70, 100, 150, 200, 250, 300, 400, 500];
    const denomination = denominations.find((d) => d >= amount) ?? amount;
    const denomStr = denomination % 1 === 0 ? String(denomination) : denomination.toFixed(1).replace(".", "-");
    const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;
    const codeSubmitUrl = `${appUrl}/checkout/gift-card?orderId=${topupRef}&amount=${denomination}&topup=true`;
    return NextResponse.json({
      data: { redirectUrl: enebaUrl, codeSubmitUrl, ref: topupRef, denomination },
      error: null,
      meta: {},
    });
  }

  if (paymentProvider === "discord") {
    const DISCORD_SERVER_URL = process.env.DISCORD_SERVER_URL ?? "https://discord.gg/your-server";
    const msg = encodeURIComponent(`Hi! I want to top up my MetraMart balance by $${amount}. My account: ${session.user.email} — Ref: ${topupRef}`);
    return NextResponse.json({
      data: { redirectUrl: `${DISCORD_SERVER_URL}?message=${msg}`, ref: topupRef },
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
        tx_ref: topupRef,
        amount,
        currency: "USD",
        redirect_url: `${appUrl}/api/webhooks/flutterwave?topupRef=${topupRef}&userId=${session.user.id}&amount=${amount}`,
        customer: { email: session.user.email },
        meta: { topupRef, userId: session.user.id, amount },
        customizations: {
          title: "Balance Top-Up",
          description: `Top up wallet by $${amount}`,
        },
      }),
    });

    if (!fwRes.ok) {
      return NextResponse.json({ data: null, error: "Failed to create card payment", meta: {} }, { status: 502 });
    }

    const fwData = await fwRes.json() as { data?: { link?: string } };
    return NextResponse.json({ data: { redirectUrl: fwData.data?.link, ref: topupRef }, error: null, meta: {} });
  }

  return NextResponse.json({ data: null, error: "Invalid payment provider", meta: {} }, { status: 400 });
}
