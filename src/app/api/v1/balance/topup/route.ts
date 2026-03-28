import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const bodySchema = z.object({
  amount: z.number().min(1).max(500),
  paymentProvider: z.enum(["nowpayments", "discord"]),
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
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
        order_description: `Velxo Balance Top-Up $${amount}`,
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

  if (paymentProvider === "discord") {
    const DISCORD_SERVER_URL = process.env.DISCORD_SERVER_URL ?? "https://discord.gg/your-server";
    const msg = encodeURIComponent(`Hi! I want to top up my Velxo balance by $${amount}. My account: ${session.user.email} — Ref: ${topupRef}`);
    return NextResponse.json({
      data: { redirectUrl: `${DISCORD_SERVER_URL}?message=${msg}`, ref: topupRef },
      error: null,
      meta: {},
    });
  }

  return NextResponse.json({ data: null, error: "Invalid payment provider", meta: {} }, { status: 400 });
}
