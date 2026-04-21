"use client";

import { useState } from "react";
import { Save, MessageCircle, Send, Globe, Percent, Store, Wrench } from "lucide-react";

interface Props {
  initialValues: Record<string, string>;
}

const SECTIONS = [
  {
    title: "Community Links",
    icon: MessageCircle,
    color: "text-indigo-400",
    fields: [
      { key: "discord_url", label: "Discord Server URL", placeholder: "https://discord.gg/...", hint: "Shown on homepage community section" },
      { key: "discord_members", label: "Discord Member Count", placeholder: "1,000+", hint: "Displayed on the community section (e.g. 1,000+)" },
      { key: "telegram_url", label: "Telegram Channel URL", placeholder: "https://t.me/...", hint: "Shown on homepage community section" },
      { key: "telegram_members", label: "Telegram Member Count", placeholder: "500+", hint: "Displayed on the community section" },
      { key: "support_discord_url", label: "Support Discord URL", placeholder: "https://discord.gg/...", hint: "Used for support buttons (defaults to Discord URL)" },
    ],
  },
  {
    title: "Store Identity",
    icon: Store,
    color: "text-blue-400",
    fields: [
      { key: "store_name", label: "Store Name", placeholder: "Velxo", hint: "Used in emails and page titles" },
      { key: "store_tagline", label: "Store Tagline", placeholder: "Premium Digital Marketplace", hint: "Shown in footer and meta" },
      { key: "hero_title", label: "Hero Title Override", placeholder: "Leave blank to use default", hint: "Overrides the homepage hero title" },
      { key: "hero_subtitle", label: "Hero Subtitle Override", placeholder: "Leave blank to use default", hint: "Overrides the homepage hero subtitle" },
    ],
  },
  {
    title: "Affiliate & Payouts",
    icon: Percent,
    color: "text-green-400",
    fields: [
      { key: "affiliate_commission_pct", label: "Promo Affiliate Commission %", placeholder: "10", hint: "Store credit commission for promo affiliates" },
      { key: "partner_commission_pct", label: "Partner Commission %", placeholder: "15", hint: "Default cash commission for new partners" },
      { key: "min_payout_amount", label: "Minimum Payout Amount ($)", placeholder: "10", hint: "Minimum balance required to request payout" },
    ],
  },
  {
    title: "Feature Toggles",
    icon: Globe,
    color: "text-purple-400",
    toggles: [
      { key: "deals_enabled", label: "Hot Deals Section", hint: "Show/hide the Deal Vault on homepage" },
      { key: "newsletter_enabled", label: "Newsletter Section", hint: "Show/hide newsletter signup on homepage" },
      { key: "reviews_enabled", label: "Product Reviews", hint: "Allow customers to leave reviews" },
    ],
  },
  {
    title: "Maintenance Mode",
    icon: Wrench,
    color: "text-yellow-400",
    toggles: [
      { key: "maintenance_mode", label: "Enable Maintenance Mode", hint: "Shows maintenance page to all visitors" },
    ],
    fields: [
      { key: "maintenance_message", label: "Maintenance Message", placeholder: "We'll be back shortly.", hint: "Message shown during maintenance" },
    ],
  },
];

export default function SiteSettingsEditor({ initialValues }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <Icon size={15} className={section.color} />
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.fields?.map(({ key, label, placeholder, hint }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1">{label}</label>
                  {hint && <p className="text-xs text-gray-600 mb-1.5">{hint}</p>}
                  <input
                    value={values[key] ?? ""}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="input-field text-sm"
                  />
                </div>
              ))}
              {section.toggles?.map(({ key, label, hint }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
                  </div>
                  <button
                    onClick={() => set(key, values[key] === "true" ? "false" : "true")}
                    className={`relative w-11 h-6 rounded-full transition-all ${values[key] === "true" ? "bg-green-500" : "bg-gray-700"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${values[key] === "true" ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button onClick={save} disabled={saving}
        className="btn-primary text-sm px-6 py-2.5 gap-2 flex items-center">
        <Save size={14} />
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save All Settings"}
      </button>
    </div>
  );
}
