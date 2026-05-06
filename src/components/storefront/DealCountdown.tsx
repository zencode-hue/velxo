"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getTimeLeft(resetAt: string) {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0 };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function DealCountdown({ resetAt, neon = false }: { resetAt: string; neon?: boolean }) {
  const [time, setTime] = useState(getTimeLeft(resetAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(resetAt)), 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  // Always gold — neon prop kept for API compatibility but ignored
  const accentColor = "#f59e0b";
  const bgColor = "rgba(245,158,11,0.1)";
  const borderColor = "rgba(245,158,11,0.3)";

  return (
    <div className="flex items-center gap-3">
      <Clock size={16} style={{ color: accentColor }} className="shrink-0" />
      <span className="text-sm text-gray-400">Resets in</span>
      <div className="flex items-center gap-1.5">
        {[
          { label: "h", value: time.h },
          { label: "m", value: time.m },
          { label: "s", value: time.s },
        ].map(({ label, value }, i) => (
          <span key={label} className="flex items-center gap-1">
            {i > 0 && <span className="font-bold" style={{ color: accentColor, opacity: 0.5 }}>:</span>}
            <span className="inline-flex flex-col items-center">
              <span className="font-mono font-bold text-white text-lg leading-none px-2 py-1 rounded-lg"
                style={{ background: bgColor, border: `1px solid ${borderColor}`, color: accentColor }}>
                {pad(value)}
              </span>
              <span className="text-[9px] text-gray-600 mt-0.5 uppercase tracking-wider">{label}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
