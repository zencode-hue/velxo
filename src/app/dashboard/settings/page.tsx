"use client";

import { useState } from "react";
import { Settings, User, Lock } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameLoading(true); setNameStatus(null);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      setNameStatus(res.ok ? "Name updated." : (data.error ?? "Failed."));
    } finally { setNameLoading(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPw !== confirmPw) { setPwStatus({ type: "error", msg: "Passwords do not match." }); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) { setPwStatus({ type: "success", msg: "Password updated." }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
      else { setPwStatus({ type: "error", msg: data.error ?? "Failed." }); }
    } finally { setPwLoading(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Settings size={22} className="text-gray-400" /> Settings
      </h1>

      <div className="space-y-6 max-w-md">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User size={14} className="text-gray-400" /> Display Name
          </h2>
          <form onSubmit={saveName} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" placeholder="Your display name" />
            {nameStatus && <p className="text-xs text-green-400">{nameStatus}</p>}
            <button type="submit" disabled={nameLoading} className="btn-primary text-sm px-5 py-2">
              {nameLoading ? "Saving…" : "Save Name"}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={14} className="text-gray-400" /> Change Password
          </h2>
          <form onSubmit={changePassword} className="space-y-3">
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className="input-field w-full" placeholder="Current password" />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} className="input-field w-full" placeholder="New password (min 8 chars)" />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="input-field w-full" placeholder="Confirm new password" />
            {pwStatus && (
              <p className={`text-xs px-3 py-2 rounded-lg border ${pwStatus.type === "success" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                {pwStatus.msg}
              </p>
            )}
            <button type="submit" disabled={pwLoading} className="btn-primary text-sm px-5 py-2">
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
