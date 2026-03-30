import { requireAdmin } from "@/lib/admin-auth";
import { Settings } from "lucide-react";
import AnnouncementEditor from "./AnnouncementEditor";
import { db } from "@/lib/db";

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
        {/* Announcement Bar Editor */}
        <AnnouncementEditor
          initialText={map["announcement_text"] ?? "🎉 New products added daily — Browse now · Instant delivery on all orders"}
          initialEnabled={map["announcement_enabled"] !== "false"}
          initialLink={map["announcement_link"] ?? "/products"}
        />

        {/* Env-based settings info */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-base font-semibold text-white">Environment Variables</h2>
          {[
            { label: "Discord Webhook", key: "DISCORD_WEBHOOK_URL", hint: "Receive sale notifications" },
            { label: "Affiliate Commission", key: "AFFILIATE_COMMISSION_PCT", hint: "Default: 10%" },
            { label: "Encryption Key", key: "ENCRYPTION_KEY", hint: "openssl rand -hex 32" },
            { label: "NOWPayments API Key", key: "NOWPAYMENTS_API_KEY", hint: "For crypto payments" },
          ].map(({ label, key, hint }) => (
            <div key={key}>
              <p className="text-sm font-medium text-white mb-0.5">{label}</p>
              <p className="text-xs text-gray-500 mb-1">{hint}</p>
              <div className="p-2.5 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
                {key}=...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
