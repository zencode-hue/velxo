"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Loader2, Users, User, ShoppingCart, Eye, AlertTriangle } from "lucide-react";

type Audience = "all" | "customers" | "guests" | "custom" | "order";

const AUDIENCE_OPTIONS: { key: Audience; label: string; desc: string; icon: typeof Users; color: string }[] = [
  {
    key: "all",
    label: "Everyone",
    desc: "Registered users + guest order emails + restock subscribers",
    icon: Users,
    color: "text-purple-400",
  },
  {
    key: "customers",
    label: "Registered Users",
    desc: "All non-banned registered accounts",
    icon: User,
    color: "text-blue-400",
  },
  {
    key: "guests",
    label: "Guests & Subscribers",
    desc: "Guest order emails + restock notification subscribers",
    icon: Mail,
    color: "text-green-400",
  },
  {
    key: "custom",
    label: "Single Email",
    desc: "Send to one specific email address",
    icon: User,
    color: "text-cyan-400",
  },
  {
    key: "order",
    label: "Order Reminder",
    desc: "Send to the customer of a specific order",
    icon: ShoppingCart,
    color: "text-yellow-400",
  },
];

export default function AdminEmailPage() {
  const [audience, setAudience] = useState<Audience>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Reset preview count when audience changes
  useEffect(() => {
    setPreviewCount(null);
    setConfirmed(false);
    setResult(null);
  }, [audience]);

  async function fetchPreview() {
    if (audience === "custom" || audience === "order") {
      setPreviewCount(1);
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: audience,
          subject: subject || "preview",
          message: message || "preview",
          preview: true,
        }),
      });
      const data = await res.json();
      if (res.ok) setPreviewCount(data.count ?? 0);
    } catch { /* ignore */ }
    finally { setPreviewing(false); }
  }

  async function send() {
    if (!subject.trim() || !message.trim()) {
      setResult({ type: "error", text: "Subject and message are required" });
      return;
    }
    if (audience === "custom" && !customEmail.trim()) {
      setResult({ type: "error", text: "Recipient email is required" });
      return;
    }
    if (audience === "order" && !orderId.trim()) {
      setResult({ type: "error", text: "Order ID is required" });
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const body: Record<string, string | boolean> = {
        to: audience,
        subject,
        message,
        type: audience === "order" ? "order_reminder" : "announcement",
      };
      if (audience === "custom") body.customEmail = customEmail;
      if (audience === "order") body.orderId = orderId;

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error ?? "Failed to send" });
        return;
      }
      const sentCount = data.sent ?? 1;
      const failedCount = data.failed ?? 0;
      setResult({
        type: "success",
        text: `Sent to ${sentCount} recipient${sentCount !== 1 ? "s" : ""}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`,
      });
      setSubject("");
      setMessage("");
      setCustomEmail("");
      setOrderId("");
      setPreviewCount(null);
      setConfirmed(false);
    } catch (e) {
      setResult({ type: "error", text: String(e) });
    } finally {
      setSending(false);
    }
  }

  const isBulk = audience === "all" || audience === "customers" || audience === "guests";
  const canSend = isBulk ? confirmed : true;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Mail size={22} className="text-purple-400" /> Email Center
      </h1>
      <p className="text-gray-500 text-sm mb-8">Send emails to your customers, guests, and subscribers.</p>

      {/* Audience selector */}
      <div className="glass-card p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Send To</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AUDIENCE_OPTIONS.map(({ key, label, desc, icon: Icon, color }) => (
            <button key={key} onClick={() => setAudience(key)}
              className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: audience === key ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
                border: audience === key ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              <Icon size={16} className={`${color} shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        {/* Audience-specific inputs */}
        {audience === "custom" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Recipient Email</label>
            <input value={customEmail} onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="customer@example.com" type="email" className="input-field text-sm py-2.5 w-full" />
          </div>
        )}

        {audience === "order" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order ID (full ID or VLX-XXXXXX)</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste the full order ID..." className="input-field text-sm py-2.5 w-full font-mono" />
            <p className="text-xs text-gray-600 mt-1">Email will be sent to the customer who placed this order.</p>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New products just dropped at Velxo Shop!" className="input-field text-sm py-2.5 w-full" />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here. Supports plain text with line breaks."
            rows={8} className="input-field text-sm resize-none w-full" />
          <p className="text-xs text-gray-600 mt-1">{message.length}/5000 characters</p>
        </div>

        {/* Bulk preview + confirmation */}
        {isBulk && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={fetchPreview} disabled={previewing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                {previewing ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                {previewing ? "Counting..." : "Preview Audience"}
              </button>
              {previewCount !== null && (
                <span className="text-sm text-purple-300 font-medium">
                  {previewCount.toLocaleString()} recipient{previewCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {previewCount !== null && previewCount > 0 && (
              <div className="p-3 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <AlertTriangle size={15} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-300 font-medium">
                    You are about to send to {previewCount.toLocaleString()} people. This cannot be undone.
                  </p>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                      className="w-3.5 h-3.5 accent-yellow-400" />
                    <span className="text-xs text-yellow-400">I confirm I want to send this bulk email</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-3 rounded-xl text-sm"
            style={{
              background: result.type === "success" ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
              border: `1px solid ${result.type === "success" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
              color: result.type === "success" ? "#34d399" : "#f87171",
            }}>
            {result.text}
          </div>
        )}

        {/* Send button */}
        <button onClick={send} disabled={sending || !canSend || (isBulk && previewCount === 0)}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending
            ? "Sending..."
            : isBulk && previewCount !== null
              ? `Send to ${previewCount.toLocaleString()} recipients`
              : "Send Email"}
        </button>

        {isBulk && !confirmed && previewCount !== null && previewCount > 0 && (
          <p className="text-xs text-center text-gray-600">Check the confirmation box above to enable sending.</p>
        )}
      </div>
    </div>
  );
}
