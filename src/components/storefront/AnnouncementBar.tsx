"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState("🎉 New products added daily — Browse now · Instant delivery on all orders");
  const [link, setLink] = useState("/products");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.announcement_text) setText(d.data.announcement_text);
        if (d.data?.announcement_link) setLink(d.data.announcement_link);
        if (d.data?.announcement_enabled === "false") setEnabled(false);
      })
      .catch(() => {});
  }, []);

  if (!visible || !enabled) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white"
      style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}>
      <Zap size={14} className="text-yellow-300 shrink-0" />
      <Link href={link} className="hover:text-purple-200 transition-colors">{text}</Link>
      <button onClick={() => setVisible(false)} className="absolute right-3 text-white/60 hover:text-white transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

