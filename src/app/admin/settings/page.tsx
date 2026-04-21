import { requireAdmin } from "@/lib/admin-auth";
import { Settings } from "lucide-react";
import AnnouncementEditor from "./AnnouncementEditor";
import SiteSettingsEditor from "./SiteSettingsEditor";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (db as any).siteSetting.findMany() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Settings size={22} className="text-purple-400" /> Settings
      </h1>

      <div className="space-y-6 max-w-2xl">
        <AnnouncementEditor
          initialText={map["announcement_text"] ?? "🎉 New products added daily — Browse now · Instant delivery on all orders"}
          initialEnabled={map["announcement_enabled"] !== "false"}
          initialLink={map["announcement_link"] ?? "/products"}
        />

        <SiteSettingsEditor
          initialValues={{
            discord_url: map["discord_url"] ?? "",
            telegram_url: map["telegram_url"] ?? "",
            support_discord_url: map["support_discord_url"] ?? "",
            affiliate_commission_pct: map["affiliate_commission_pct"] ?? "10",
            partner_commission_pct: map["partner_commission_pct"] ?? "15",
            store_name: map["store_name"] ?? "Velxo",
            store_tagline: map["store_tagline"] ?? "Premium Digital Marketplace",
            hero_title: map["hero_title"] ?? "",
            hero_subtitle: map["hero_subtitle"] ?? "",
            deals_enabled: map["deals_enabled"] ?? "true",
            newsletter_enabled: map["newsletter_enabled"] ?? "true",
            reviews_enabled: map["reviews_enabled"] ?? "true",
            min_payout_amount: map["min_payout_amount"] ?? "10",
            maintenance_mode: map["maintenance_mode"] ?? "false",
            maintenance_message: map["maintenance_message"] ?? "We'll be back shortly.",
          }}
        />
      </div>
    </div>
  );
}
