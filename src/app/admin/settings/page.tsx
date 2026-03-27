import { requireAdmin } from "@/lib/admin-auth";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Settings size={22} className="text-purple-400" /> Settings
      </h1>

      <div className="glass-card p-6 max-w-lg space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Discord Webhook</h2>
          <p className="text-sm text-gray-500 mb-3">
            Set <code className="text-purple-300">DISCORD_WEBHOOK_URL</code> in your environment variables to receive sale notifications.
          </p>
          <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
            DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-1">Affiliate Commission</h2>
          <p className="text-sm text-gray-500 mb-3">
            Set <code className="text-purple-300">AFFILIATE_COMMISSION_PCT</code> in your environment variables (default: 10%).
          </p>
          <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
            AFFILIATE_COMMISSION_PCT=10
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-1">Encryption Key</h2>
          <p className="text-sm text-gray-500">
            Generate a 32-byte hex key: <code className="text-purple-300">openssl rand -hex 32</code>
          </p>
        </div>
      </div>
    </div>
  );
}
