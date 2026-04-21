"use client";

import Link from "next/link";
import { MessageCircle, Send, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  discordUrl: string;
  telegramUrl?: string;
  discordMembers?: string;
  telegramMembers?: string;
}

const slides = [
  {
    key: "discord",
    icon: MessageCircle,
    color: "#5865f2",
    glow: "rgba(88,101,242,0.15)",
    border: "rgba(88,101,242,0.25)",
    label: "Discord Community",
    cta: "Join Discord",
    desc: "Get instant support, exclusive deals, and connect with thousands of members.",
  },
  {
    key: "telegram",
    icon: Send,
    color: "#0088cc",
    glow: "rgba(0,136,204,0.15)",
    border: "rgba(0,136,204,0.25)",
    label: "Telegram Channel",
    cta: "Join Telegram",
    desc: "Get deal alerts, restock notifications, and updates straight to your phone.",
  },
];

export default function CommunitySection({ discordUrl, telegramUrl, discordMembers = "1,000+", telegramMembers = "" }: Props) {
  const [active, setActive] = useState(0);

  // Only show slides that have URLs
  const available = slides.filter((s) => {
    if (s.key === "discord") return !!discordUrl;
    if (s.key === "telegram") return !!telegramUrl;
    return false;
  });

  useEffect(() => {
    if (available.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % available.length), 5000);
    return () => clearInterval(t);
  }, [available.length]);

  if (available.length === 0) return null;

  const slide = available[active];
  const Icon = slide.icon;
  const url = slide.key === "discord" ? discordUrl : (telegramUrl ?? "");
  const members = slide.key === "discord" ? discordMembers : telegramMembers;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative rounded-2xl overflow-hidden transition-all duration-500"
        style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${slide.border}`, boxShadow: `0 0 40px ${slide.glow}` }}>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${slide.glow} 0%, transparent 60%)` }} />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500"
                style={{ background: `${slide.glow}`, border: `1px solid ${slide.border}` }}>
                <Icon size={26} style={{ color: slide.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">{slide.label}</h2>
                  {members && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${slide.glow}`, color: slide.color, border: `1px solid ${slide.border}` }}>
                      <Users size={10} className="inline mr-1" />{members} members
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{slide.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {available.length > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setActive((a) => (a - 1 + available.length) % available.length)}
                    className="p-1.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <ArrowLeft size={14} />
                  </button>
                  {available.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{ background: i === active ? slide.color : "rgba(255,255,255,0.2)" }} />
                  ))}
                  <button onClick={() => setActive((a) => (a + 1) % available.length)}
                    className="p-1.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              <Link href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
                style={{ background: slide.color, boxShadow: `0 4px 20px ${slide.glow}` }}>
                <Icon size={15} />
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
