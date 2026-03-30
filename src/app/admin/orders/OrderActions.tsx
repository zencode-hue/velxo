"use client";

import { useState } from "react";
import { ChevronDown, FileText, Loader2 } from "lucide-react";

const STATUSES = ["PENDING", "PAID", "FAILED", "PENDING_STOCK", "REFUNDED"] as const;

export default function OrderActions({ orderId, currentStatus, currentNote }: {
  orderId: string;
  currentStatus: string;
  currentNote?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(currentNote ?? "");
  const [showNote, setShowNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(newStatus?: string) {
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus ?? status, adminNote: note }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="relative">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); save(e.target.value); }}
          className="text-xs bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white appearance-none pr-6 cursor-pointer"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      <button onClick={() => setShowNote(!showNote)} title="Add note"
        className="p-1.5 rounded-lg border border-white/10 hover:border-purple-500/40 transition-colors">
        <FileText size={12} className={note ? "text-purple-400" : "text-gray-500"} />
      </button>

      {saving && <Loader2 size={12} className="animate-spin text-purple-400" />}
      {saved && <span className="text-xs text-green-400">Saved</span>}

      {showNote && (
        <div className="absolute right-0 top-8 z-20 w-64 glass-card p-3 shadow-xl">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Admin note..."
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white resize-none"
          />
          <button onClick={() => { save(); setShowNote(false); }}
            className="mt-2 w-full text-xs py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-white transition-colors">
            Save Note
          </button>
        </div>
      )}
    </div>
  );
}
