"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function CreateDiscountForm() {
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", usageLimit: "100", expiresAt: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          usageLimit: Number(form.usageLimit),
          expiresAt: new Date(form.expiresAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Discount code created.");
        setForm({ code: "", type: "PERCENTAGE", value: "", usageLimit: "100", expiresAt: "" });
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ Failed to create code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-base font-semibold text-white mb-5">Create Discount Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Code</label>
          <input value={form.code} onChange={(e) => set("code", e.target.value)} required
            placeholder="SUMMER20" className="input-field text-sm uppercase" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="input-field text-sm">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Value</label>
            <input type="number" min="0" step="0.01" value={form.value}
              onChange={(e) => set("value", e.target.value)} required
              placeholder={form.type === "PERCENTAGE" ? "20" : "5.00"}
              className="input-field text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Usage Limit</label>
            <input type="number" min="1" value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)} required
              className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Expires At</label>
            <input type="date" value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)} required
              className="input-field text-sm" />
          </div>
        </div>
        {status && (
          <p className={`text-sm ${status.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{status}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2.5 gap-2 w-full">
          <Plus size={15} />{loading ? "Creating…" : "Create Code"}
        </button>
      </form>
    </div>
  );
}
