import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return NextResponse.json({ error: "Discord webhook not configured" }, { status: 503 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";

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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
