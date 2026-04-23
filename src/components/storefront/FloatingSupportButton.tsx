"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";

export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [discordUrl, setDiscordUrl] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch settings from public endpoint
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data?.data ?? {};
        setDiscordUrl(s.support_discord_url || s.discord_url || null);
        setTelegramUrl(s.telegram_url || null);
      })
      .catch(() => {});

    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible || (!discordUrl && !telegramUrl)) return null;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 mb-1">
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(88,101,242,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(88,101,242,0.4)" }}
            >
              <MessageCircle size={15} /> Discord Support
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          )}
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(0,136,204,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,136,204,0.4)" }}
            >
              <Send size={15} /> Telegram
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: open ? "rgba(255,255,255,0.1)" : "rgba(167,139,250,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: open ? "none" : "0 4px 24px rgba(167,139,250,0.4)",
          transform: open ? "rotate(45deg)" : "none",
        }}
        aria-label="Support"
      >
        {open ? <X size={20} className="text-white" /> : <MessageCircle size={20} className="text-white" />}
      </button>
    </div>
  );
}
