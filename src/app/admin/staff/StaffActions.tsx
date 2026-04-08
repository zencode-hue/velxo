"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffActions({
  staffId,
  currentStatus,
}: {
  staffId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <div className="flex items-center justify-end gap-2">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => updateStatus("ACTIVE")}
          disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button
          onClick={() => updateStatus("SUSPENDED")}
          disabled={loading}
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
        >
          Suspend
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button
          onClick={() => updateStatus("ACTIVE")}
          disabled={loading}
          className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
        >
          Reactivate
        </button>
      )}
      <button
        onClick={deleteStaff}
        disabled={loading}
        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
