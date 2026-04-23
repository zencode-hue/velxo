import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public read-only settings endpoint — only exposes safe keys
const PUBLIC_KEYS = [
  "discord_url",
  "support_discord_url",
  "telegram_url",
  "discord_members",
  "telegram_members",
  "store_name",
  "store_tagline",
  "hero_title",
  "hero_subtitle",
  "deals_enabled",
  "newsletter_enabled",
  "reviews_enabled",
  "maintenance_mode",
  "maintenance_message",
  "affiliate_commission_pct",
  "announcement_enabled",
  "announcement_text",
  "announcement_link",
];

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (db as any).siteSetting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });
  const data: Record<string, string> = {};
  for (const row of rows) data[row.key] = row.value;
  return NextResponse.json({ data, error: null });
}
