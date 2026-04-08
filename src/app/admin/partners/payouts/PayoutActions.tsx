"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function PayoutActions({ payoutId }: { payoutId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");

  async function process(action: "approve" | "reject") {
    setLoading(true);
    try {
      await fetch(`/api/admin/partners/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, txHash: txHash || undefined, adminNote: note || undefined }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setApproving(false);
    }
  }

  if (approving) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <input value={txHash} onChange={(e) => setTxHash(e.target.value)}
          className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-48"
          placeholder="TX Hash (optional)" />
        <input value={note} onChange={(e) => setNote(e.target.value)}
          className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-48"
          placeholder="Admin note (optional)" />
        <div className="flex gap-2">
          <button onClick={() => process("approve")} disabled={loading}
            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 disabled:opacity-50">
            <Check size={12} /> Confirm Approve
          </button>
          <button onClick={() => setApproving(false)} className="text-xs text-gray-500 hover:text-white">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => setApproving(true)} disabled={loading}
        className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 disabled:opacity-50">
        <Check size={12} /> Approve
      </button>
      <button onClick={() => process("reject")} disabled={loading}
        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 disabled:opacity-50">
        <X size={12} /> Reject
      </button>
    </div>
  );
}
