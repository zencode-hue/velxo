"use client";

import { useState } from "react";
import { Mail, Send, Loader2, Users, User, ShoppingCart } from "lucide-react";

export default function AdminEmailPage() {
  const [tab, setTab] = useState<"bulk" | "single" | "order">("single");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    if (!subject.trim() || !message.trim()) { setResult("Subject and message are required"); return; }
    setSending(true); setResult(null);
    try {
      const body: Record<string, string> = { subject, message };
      if (tab === "bulk") { body.to = "all"; body.type = "announcement"; }
      else if (tab === "single") { body.to = "custom"; body.customEmail = customEmail; body.type = "custom"; }
      else { body.to = "custom"; body.customEmail = ""; body.type = "order_reminder"; body.orderId = orderId; }

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setResult(`Error: ${data.error}`); return; }
      setResult(`Sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}${data.errors ? ` (${data.errors} failed)` : ""}`);
      setSubject(""); setMessage(""); setCustomEmail(""); setOrderId("");
    } catch (e) {
      setResult("Error: " + String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Mail size={22} className="text-purple-400" /> Email Center
      </h1>
      <p className="text-gray-500 text-sm mb-8">Send emails via Resend to customers or specific orders.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 w-fit">
        {[
          { key: "single", label: "Single Email", icon: User },
          { key: "order", label: "Order Reminder", icon: ShoppingCart },
          { key: "bulk", label: "Bulk (All Users)", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        {tab === "single" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Recipient Email</label>
            <input value={customEmail} onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="customer@example.com" type="email" className="input-field text-sm py-2.5 w-full" />
          </div>
        )}

        {tab === "order" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order ID</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)}
              placeholder="Paste the full order ID..." className="input-field text-sm py-2.5 w-full font-mono" />
            <p className="text-xs text-gray-600 mt-1">Email will be sent to the customer who placed this order.</p>
          </div>
        )}

        {tab === "bulk" && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <p className="text-xs text-orange-400">This will send to all verified, non-banned users (up to 500). Use carefully.</p>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Your order is ready..." className="input-field text-sm py-2.5 w-full" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..." rows={8}
            className="input-field text-sm resize-none w-full" />
        </div>

        {result && (
          <p className={`text-sm ${result.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{result}</p>
        )}

        <button onClick={send} disabled={sending}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? "Sending..." : "Send Email"}
        </button>
      </div>
    </div>
  );
}
