import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/lib/discord";

const DISCOUNT_PCT = 20;
const DEALS_COUNT = 7;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDaySeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization header, or allow manual trigger with secret param
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = secretParam === process.env.CRON_SECRET;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.DISCORD_DEALS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "No webhook configured" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

  // Fetch deals
  const res = await fetch(`${appUrl}/api/v1/deals`, { cache: "no-store" });
  const data = await res.json();
  const deals = data.data?.deals ?? [];

  if (!deals.length) {
    return NextResponse.json({ ok: false, message: "No deals to notify" });
  }

  const seed = getDaySeed();
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Build the exclusive Discord embed
  const dealFields = deals.slice(0, DEALS_COUNT).map((d: { title: string; originalPrice: number; dealPrice: number; savings: number; id: string }) => ({
    name: `${d.title}`,
    value: [
      `~~$${d.originalPrice.toFixed(2)}~~ → **$${d.dealPrice.toFixed(2)}**`,
      `Save **$${d.savings.toFixed(2)}** (${DISCOUNT_PCT}% OFF)`,
      `[Grab Deal](${appUrl}/checkout/confirm?productId=${d.id})`,
    ].join("\n"),
    inline: true,
  }));

  const payload = {
    username: "Velxo Shop",
    avatar_url: `${appUrl}/logo.png`,
    embeds: [
      {
        title: "🔥  DAILY DEAL VAULT — NOW OPEN",
        description: [
          `> **${deals.length} exclusive deals** just dropped for **${dateStr}**`,
          `> Each deal is **${DISCOUNT_PCT}% OFF** — vault resets at midnight UTC`,
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          `**[→ View All Deals](${appUrl}/deals)**`,
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ].join("\n"),
        color: 0xea580c, // orange
        fields: dealFields,
        footer: {
          text: `Velxo Shop • Deals reset daily at midnight UTC • Seed #${seed}`,
          icon_url: `${appUrl}/logo.png`,
        },
        timestamp: new Date().toISOString(),
        thumbnail: { url: `${appUrl}/logo.png` },
      },
    ],
  };

  await sendDiscordNotification(webhookUrl, payload);

  return NextResponse.json({ ok: true, dealsNotified: deals.length });
}
