import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getServerSession } from "@/lib/auth";
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

export async function POST(req: NextRequest) {
  try {
    // Check admin session
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, message } = await req.json();
    const webhookUrl = process.env.DISCORD_DEALS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return NextResponse.json({ error: "Discord webhook not configured" }, { status: 503 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

    // Push today's deals
    if (type === "deals") {
      const res = await fetch(`${appUrl}/api/v1/deals`, { cache: "no-store" });
      const data = await res.json();
      const deals = (data.data?.deals ?? []).slice(0, DEALS_COUNT);

      if (!deals.length) return NextResponse.json({ ok: false, message: "No deals to notify" });

      const seed = getDaySeed();
      const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

      const dealFields = deals.map((d: { title: string; originalPrice: number; dealPrice: number; savings: number; id: string }) => ({
        name: d.title,
        value: [
          `~~$${d.originalPrice.toFixed(2)}~~ → **$${d.dealPrice.toFixed(2)}**`,
          `Save **$${d.savings.toFixed(2)}** (${DISCOUNT_PCT}% OFF)`,
          `[Grab Deal](${appUrl}/checkout/confirm?productId=${d.id}&dealPrice=${d.dealPrice})`,
        ].join("\n"),
        inline: true,
      }));

      await sendDiscordNotification(webhookUrl, {
        username: "Velxo Shop",
        embeds: [{
          title: "DAILY DEAL VAULT — NOW OPEN",
          description: [
            `> **${deals.length} exclusive deals** just dropped for **${dateStr}**`,
            `> Each deal is **${DISCOUNT_PCT}% OFF** — vault resets at midnight UTC`,
            "",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `**[View All Deals](${appUrl}/deals)**`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          ].join("\n"),
          color: 0xea580c,
          fields: dealFields,
          footer: { text: `Velxo Shop • Deals reset daily at midnight UTC • Seed #${seed}` },
          timestamp: new Date().toISOString(),
        }],
      });

      return NextResponse.json({ ok: true, dealsNotified: deals.length });
    }

    // Custom message
    if (message?.trim()) {
      await sendDiscordNotification(webhookUrl, {
        username: "Velxo Shop",
        embeds: [{
          description: message,
          color: 0xea580c,
          footer: { text: "Velxo Shop Admin Announcement" },
          timestamp: new Date().toISOString(),
          author: { name: "Velxo Shop", url: appUrl },
        }],
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("[discord-push]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
