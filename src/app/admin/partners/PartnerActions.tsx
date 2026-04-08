"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerActions({
  partnerId,
  currentStatus,
  commissionPct,
}: {
  partnerId: string;
  currentStatus: string;
  commissionPct: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingPct, setEditingPct] = useState(false);
  const [pct, setPct] = useState(String(commissionPct));

  async function update(data: object) {
    setLoading(true);
    try {
      await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {editingPct ? (
        <div className="flex items-center gap-1">
          <input value={pct} onChange={(e) => setPct(e.target.value)} type="number" min="1" max="50"
            className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-16"
            onKeyDown={(e) => { if (e.key === "Enter") { update({ commissionPct: Number(pct) }); setEditingPct(false); } }}
          />
          <span className="text-xs text-gray-500">%</span>
          <button onClick={() => { update({ commissionPct: Number(pct) }); setEditingPct(false); }}
            className="text-xs text-green-400 hover:text-green-300">Save</button>
          <button onClick={() => setEditingPct(false)} className="text-xs text-gray-500 hover:text-white">✕</button>
        </div>
      ) : (
        <button onClick={() => setEditingPct(true)} className="text-xs text-gray-500 hover:text-white transition-colors">
          Edit %
        </button>
      )}

      {currentStatus === "PENDING" && (
        <button onClick={() => update({ status: "ACTIVE" })} disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50">
          Approve
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button onClick={() => update({ status: "SUSPENDED" })} disabled={loading}
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50">
          Suspend
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button onClick={() => update({ status: "ACTIVE" })} disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50">
          Reactivate
        </button>
      )}
    </div>
  );
}
