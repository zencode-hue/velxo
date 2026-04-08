"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";

export default function StaffProfilePage() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (newPass !== confirm) {
      setStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", msg: "Password updated successfully." });
        setCurrent(""); setNewPass(""); setConfirm("");
      } else {
        setStatus({ type: "error", msg: data.error ?? "Update failed." });
      }
    } catch {
      setStatus({ type: "error", msg: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <User size={22} className="text-orange-400" /> My Profile
      </h1>

      <div className="glass-card p-6 max-w-md">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={15} className="text-gray-400" /> Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              minLength={8}
              className="input-field w-full"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>

          {status && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${
              status.type === "success"
                ? "text-green-400 bg-green-400/10 border-green-400/20"
                : "text-red-400 bg-red-400/10 border-red-400/20"
            }`}>
              {status.msg}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
