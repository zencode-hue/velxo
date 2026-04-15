"use client";

import { useState, useEffect } from "react";
import { User, Lock, Phone, Briefcase, FileText, Mail, Calendar, Shield, Edit3, Check, X } from "lucide-react";

interface StaffProfile {
  id: string;
  name: string;
  email: string;
  position: string | null;
  bio: string | null;
  phone: string | null;
  status: string;
  joinedAt: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", position: "", bio: "", phone: "" });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/staff/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setProfile(d.data);
          setForm({
            name: d.data.name ?? "",
            position: d.data.position ?? "",
            bio: d.data.bio ?? "",
            phone: d.data.phone ?? "",
          });
        }
      });
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => prev ? { ...prev, ...data.data } : prev);
        setEditing(false);
        setSaveStatus("Saved");
      } else {
        setSaveStatus(data.error ?? "Failed");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPass !== confirm) { setPwStatus({ type: "error", msg: "Passwords do not match." }); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: "success", msg: "Password updated successfully." });
        setCurrent(""); setNewPass(""); setConfirm("");
      } else {
        setPwStatus({ type: "error", msg: data.error ?? "Update failed." });
      }
    } finally {
      setSavingPw(false);
    }
  }

  const initials = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
  const joinDate = profile?.joinedAt ?? profile?.createdAt;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <User size={22} className="text-blue-400" /> My Profile
      </h1>

      {/* Profile card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.name ?? "—"}</h2>
              <p className="text-sm text-blue-400 font-medium mt-0.5">{profile?.position ?? "Staff Member"}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLOR[profile?.status ?? "PENDING"] ?? ""}`}>
                  {profile?.status ?? "—"}
                </span>
                {joinDate && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={11} /> Joined {new Date(joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            <Edit3 size={13} /> {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Info grid */}
        {!editing ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="Email" value={profile?.email} />
            <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? "Not set"} />
            <InfoRow icon={Briefcase} label="Position" value={profile?.position ?? "Not set"} />
            <InfoRow icon={Shield} label="Account Status" value={profile?.status} />
            {profile?.bio && (
              <div className="sm:col-span-2">
                <InfoRow icon={FileText} label="Bio" value={profile.bio} />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field w-full" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Position / Role</label>
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="input-field w-full" placeholder="e.g. Support Agent" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field w-full" placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3} maxLength={300} className="input-field w-full resize-none"
                placeholder="A short bio about yourself…" />
              <p className="text-xs text-gray-600 mt-1">{form.bio.length}/300</p>
            </div>
            {saveStatus && <p className="text-xs text-red-400">{saveStatus}</p>}
            <div className="flex gap-3">
              <button onClick={saveProfile} disabled={savingProfile}
                className="btn-primary text-sm px-5 py-2 gap-2 flex items-center">
                <Check size={14} /> {savingProfile ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)}
                className="btn-secondary text-sm px-5 py-2 gap-2 flex items-center">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Lock size={15} className="text-gray-400" /> Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Current Password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
              required className="input-field w-full" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
              required minLength={8} className="input-field w-full" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              required className="input-field w-full" placeholder="••••••••" />
          </div>
          {pwStatus && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${
              pwStatus.type === "success"
                ? "text-green-400 bg-green-400/10 border-green-400/20"
                : "text-red-400 bg-red-400/10 border-red-400/20"
            }`}>{pwStatus.msg}</p>
          )}
          <button type="submit" disabled={savingPw} className="btn-primary text-sm px-6 py-2.5">
            {savingPw ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
      <Icon size={15} className="text-gray-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-white mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}
