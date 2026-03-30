"use client";

import { useState } from "react";
import { Edit2, Trash2, DollarSign, X, Check, Ban, ShieldCheck } from "lucide-react";

interface Props {
  userId: string;
  email: string;
  name: string;
  role: string;
  balance: number;
  isBanned?: boolean;
}

export default function UserActions({ userId, email, name, role, balance, isBanned = false }: Props) {
  const [mode, setMode] = useState<"idle" | "edit" | "balance" | "delete" | "ban">("idle");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [banned, setBanned] = useState(isBanned);

  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editRole, setEditRole] = useState(role);
  const [banReason, setBanReason] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState<"ADMIN_CREDIT" | "ADMIN_DEBIT">("ADMIN_CREDIT");
  const [balanceDesc, setBalanceDesc] = useState("");

  async function handleEdit() {
    setLoading(true); setErr(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail, role: editRole }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setErr(d.error); return; }
    setMode("idle"); window.location.reload();
  }

  async function handleBalance() {
    const amt = parseFloat(balanceAmount);
    if (!amt || amt <= 0) { setErr("Enter a valid amount"); return; }
    setLoading(true); setErr(null);
    const res = await fetch(`/api/admin/users/${userId}/balance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt, type: balanceType, description: balanceDesc || undefined }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setErr(d.error); return; }
    setMode("idle"); window.location.reload();
  }

  async function handleDelete() {
    setLoading(true); setErr(null);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setErr(d.error); return; }
    window.location.reload();
  }

  async function handleBanToggle() {
    if (banned) {
      setLoading(true);
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: false, banReason: null }),
      });
      setLoading(false);
      setBanned(false); setMode("idle");
    } else {
      setMode("ban");
    }
  }

  async function confirmBan() {
    setLoading(true); setErr(null);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: true, banReason: banReason || "Banned by admin" }),
    });
    setLoading(false);
    setBanned(true); setMode("idle");
  }

  if (mode === "idle") {
    return (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setMode("edit")} className="text-xs text-purple-400 hover:text-purple-300 transition-colors p-1" title="Edit"><Edit2 size={13} /></button>
        <button onClick={() => setMode("balance")} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors p-1" title="Adjust balance"><DollarSign size={13} /></button>
        <button onClick={handleBanToggle} className={`text-xs p-1 transition-colors ${banned ? "text-green-400 hover:text-green-300" : "text-orange-400 hover:text-orange-300"}`} title={banned ? "Unban" : "Ban"}>
          {banned ? <ShieldCheck size={13} /> : <Ban size={13} />}
        </button>
        <button onClick={() => setMode("delete")} className="text-xs text-red-400 hover:text-red-300 transition-colors p-1" title="Delete"><Trash2 size={13} /></button>
      </div>
    );
  }

  if (mode === "ban") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMode("idle")}>
        <div className="glass-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Ban User</h3>
            <button onClick={() => setMode("idle")}><X size={16} className="text-gray-400" /></button>
          </div>
          <p className="text-sm text-gray-400">Banning <span className="text-white">{email}</span> will prevent them from logging in.</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
            <input value={banReason} onChange={(e) => setBanReason(e.target.value)} className="input-field text-sm py-2" placeholder="Reason for ban..." />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode("idle")} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button onClick={confirmBan} disabled={loading} className="flex-1 text-sm py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors">
              {loading ? "Banningâ€¦" : "Ban User"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMode("idle")}>
        <div className="glass-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Edit User</h3>
            <button onClick={() => setMode("idle")}><X size={16} className="text-gray-400" /></button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field text-sm py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Role</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="input-field text-sm py-2">
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode("idle")} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button onClick={handleEdit} disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? "Savingâ€¦" : "Save"}</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "balance") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMode("idle")}>
        <div className="glass-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Adjust Balance</h3>
            <button onClick={() => setMode("idle")}><X size={16} className="text-gray-400" /></button>
          </div>
          <p className="text-xs text-gray-500">Current: <span className="text-cyan-400 font-medium">${balance.toFixed(2)}</span></p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select value={balanceType} onChange={(e) => setBalanceType(e.target.value as "ADMIN_CREDIT" | "ADMIN_DEBIT")} className="input-field text-sm py-2">
              <option value="ADMIN_CREDIT">Credit (Add)</option>
              <option value="ADMIN_DEBIT">Debit (Remove)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="input-field text-sm py-2" placeholder="10.00" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
            <input value={balanceDesc} onChange={(e) => setBalanceDesc(e.target.value)} className="input-field text-sm py-2" placeholder="Reason..." />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode("idle")} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button onClick={handleBalance} disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? "Savingâ€¦" : "Apply"}</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMode("idle")}>
        <div className="glass-card p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold text-white">Delete User?</h3>
          <p className="text-sm text-gray-400">This will permanently delete <span className="text-white">{email}</span>. Cannot be undone.</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode("idle")} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 text-sm py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-1">
              <Check size={13} /> {loading ? "Deletingâ€¦" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
