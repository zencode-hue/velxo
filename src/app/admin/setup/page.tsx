"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function SetupPage() {
  return <SetupClient />;
}

function SetupClient() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [discordMsg, setDiscordMsg] = useState("");
  const [discordSending, setDiscordSending] = useState(false);
  const [discordResult, setDiscordResult] = useState<string | null>(null);

  async function run(name: string, url: string) {
    setLoading((l) => ({ ...l, [name]: true }));
    try {
      const token = prompt("Enter ADMIN_SETUP_TOKEN:");
      if (!token) return;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setResults((r) => ({ ...r, [name]: data.message ?? data.error ?? JSON.stringify(data) }));
    } catch (e) {
      setResults((r) => ({ ...r, [name]: "Error: " + String(e) }));
    } finally {
      setLoading((l) => ({ ...l, [name]: false }));
    }
  }

  async function pushDealsNotification() {
    setDiscordSending(true);
    setDiscordResult(null);
    try {
      const secret = prompt("Enter CRON_SECRET:");
      if (!secret) return;
      const res = await fetch(`/api/cron/deals-notify?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      setDiscordResult(data.ok ? `Sent! ${data.dealsNotified} deals notified.` : `Error: ${data.error ?? data.message}`);
    } catch (e) {
      setDiscordResult("Error: " + String(e));
    } finally {
      setDiscordSending(false);
    }
  }

  async function pushCustomMessage() {
    if (!discordMsg.trim()) return;
    setDiscordSending(true);
    setDiscordResult(null);
    try {
      const res = await fetch("/api/admin/discord-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: discordMsg }),
      });
      const data = await res.json();
      setDiscordResult(data.ok ? "Message sent to Discord!" : `Error: ${data.error}`);
      if (data.ok) setDiscordMsg("");
    } catch (e) {
      setDiscordResult("Error: " + String(e));
    } finally {
      setDiscordSending(false);
    }
  }

  const tasks = [
    { name: "Seed Products", url: "/api/auth/seed-products", desc: "Add 37 products to the database" },
    { name: "Fix Products (Unlimited Stock)", url: "/api/auth/fix-products", desc: "Set all products to unlimited stock + 100-999 count" },
    { name: "Seed Blog Posts", url: "/api/auth/seed-blog", desc: "Add 6 blog posts to the database" },
    { name: "Set Product Ratings", url: "/api/auth/seed-ratings", desc: "Give all products 4.2â€“5.0 star ratings" },
    { name: "Setup Admin", url: "/api/auth/setup-admin", desc: "Create the admin account" },
  ];

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">One-Time Setup</h1>
        <p className="text-gray-500 text-sm mb-8">Run these tasks once to initialize your store data.</p>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.name} className="glass-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white text-sm">{task.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.desc}</p>
                {results[task.name] && (
                  <p className={`text-xs mt-1 ${results[task.name].includes("Error") ? "text-red-400" : "text-green-400"}`}>
                    {results[task.name]}
                  </p>
                )}
              </div>
              <button onClick={() => run(task.name, task.url)} disabled={loading[task.name]} className="btn-primary text-sm px-5 py-2 shrink-0">
                {loading[task.name] ? "Runningâ€¦" : "Run"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discord Push */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Send size={18} className="text-orange-400" /> Discord Notifications
        </h2>
        <p className="text-gray-500 text-sm mb-5">Push messages to your Discord server manually.</p>

        <div className="space-y-4">
          {/* Push today's deals */}
          <div className="glass-card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">Push Today&apos;s Hot Deals</p>
              <p className="text-xs text-gray-500 mt-0.5">Send the current daily deals embed to Discord right now</p>
            </div>
            <button onClick={pushDealsNotification} disabled={discordSending} className="btn-primary text-sm px-5 py-2 shrink-0 flex items-center gap-2">
              {discordSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Push Deals
            </button>
          </div>

          {/* Custom message */}
          <div className="glass-card p-5 space-y-3">
            <p className="font-semibold text-white text-sm">Custom Discord Message</p>
            <p className="text-xs text-gray-500">Send any custom announcement to your Discord webhook</p>
            <textarea
              value={discordMsg}
              onChange={(e) => setDiscordMsg(e.target.value)}
              placeholder="Type your announcement here... e.g. New products just added! Check them out at velxo.shop/products"
              rows={4}
              className="input-field text-sm resize-none w-full"
            />
            <button onClick={pushCustomMessage} disabled={discordSending || !discordMsg.trim()} className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
              {discordSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send to Discord
            </button>
          </div>

          {discordResult && (
            <p className={`text-sm ${discordResult.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {discordResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
