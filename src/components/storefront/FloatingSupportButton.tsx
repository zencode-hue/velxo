"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, ExternalLink, HelpCircle } from "lucide-react";

// Fallback URLs if not set in admin settings
const FALLBACK_DISCORD = process.env.NEXT_PUBLIC_DISCORD_URL ?? "";
const FALLBACK_TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "";

export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(FALLBACK_DISCORD);
  const [telegramUrl, setTelegramUrl] = useState(FALLBACK_TELEGRAM);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data?.data ?? {};
        if (s.support_discord_url || s.discord_url) {
          setDiscordUrl(s.support_discord_url || s.discord_url);
        }
        if (s.telegram_url) setTelegramUrl(s.telegram_url);
      })
      .catch(() => {});

    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Always show if at least one URL is set (including fallbacks)
  const hasAnyLink = discordUrl || telegramUrl;
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2.5">
      {/* Options panel */}
      {open && (
        <div className="flex flex-col gap-2 mb-1 animate-fade-up">
          {discordUrl && (
            <a href={discordUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: "rgba(88,101,242,0.92)", backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(88,101,242,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <MessageCircle size={15} /> Discord Support
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          )}
          {telegramUrl && (
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: "rgba(0,136,204,0.92)", backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(0,136,204,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Send size={15} /> Telegram
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          )}
          {!hasAnyLink && (
            <a href="/support"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: "rgba(167,139,250,0.9)", backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(167,139,250,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <HelpCircle size={15} /> Support Center
            </a>
          )}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative"
        style={{
          background: open
            ? "rgba(30,30,30,0.95)"
            : "linear-gradient(135deg, #5865f2, #7289da)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 28px rgba(88,101,242,0.55), 0 0 0 0 rgba(88,101,242,0.4)",
          transform: open ? "rotate(45deg)" : "scale(1)",
        }}
        aria-label="Support"
      >
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "rgba(88,101,242,0.6)" }} />
        )}
      </button>
    </div>
  );
}
