"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffActions({
  staffId,
  currentStatus,
  currentPosition,
}: {
  staffId: string;
  currentStatus: string;
  currentPosition?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingPos, setEditingPos] = useState(false);
  const [position, setPosition] = useState(currentPosition ?? "");

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function savePosition() {
    setLoading(true);
    try {
      await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position }),
      });
      setEditingPos(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteStaff() {
    if (!confirm("Delete this staff account? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/staff/${staffId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {editingPos ? (
        <div className="flex items-center gap-1">
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-32"
            placeholder="Position"
            onKeyDown={(e) => e.key === "Enter" && savePosition()}
          />
          <button onClick={savePosition} disabled={loading} className="text-xs text-green-400 hover:text-green-300">Save</button>
          <button onClick={() => setEditingPos(false)} className="text-xs text-gray-500 hover:text-white">✕</button>
        </div>
      ) : (
        <button onClick={() => setEditingPos(true)} className="text-xs text-gray-500 hover:text-white transition-colors">
          {currentPosition ? "Edit Role" : "Set Role"}
        </button>
      )}

      {currentStatus === "PENDING" && (
        <button onClick={() => updateStatus("ACTIVE")} disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50">
          Approve
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button onClick={() => updateStatus("SUSPENDED")} disabled={loading}
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50">
          Suspend
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button onClick={() => updateStatus("ACTIVE")} disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50">
          Reactivate
        </button>
      )}
      <button onClick={deleteStaff} disabled={loading}
        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}
