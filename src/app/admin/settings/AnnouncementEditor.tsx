"use client";

import { useState } from "react";
import { Loader2, Megaphone } from "lucide-react";

export default function AnnouncementEditor({ initialText, initialEnabled, initialLink }: {
  initialText: string;
  initialEnabled: boolean;
  initialLink: string;
}) {
  const [text, setText] = useState(initialText);
  const [link, setLink] = useState(initialLink);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        announcement_text: text,
        announcement_enabled: String(enabled),
        announcement_link: link,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Megaphone size={16} className="text-yellow-400" /> Announcement Bar
        </h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-gray-500">{enabled ? "Enabled" : "Disabled"}</span>
          <div
            onClick={() => setEnabled(!enabled)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${enabled ? "bg-purple-600" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? "left-5" : "left-0.5"}`} />
          </div>
        </label>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Message Text</label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field text-sm py-2 w-full"
          placeholder="🎉 New products added daily..."
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Link URL</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="input-field text-sm py-2 w-full"
          placeholder="/products"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-green-400 text-sm">Saved!</span>}
      </div>
    </div>
  );
}
