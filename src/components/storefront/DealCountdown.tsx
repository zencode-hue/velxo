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

export default function DealCountdown({ resetAt }: { resetAt: string }) {
  const [time, setTime] = useState(getTimeLeft(resetAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(resetAt)), 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  return (
    <div className="flex items-center gap-3">
      <Clock size={16} className="text-orange-400 shrink-0" />
      <span className="text-sm text-gray-400">Resets in</span>
      <div className="flex items-center gap-1.5">
        {[
          { label: "h", value: time.h },
          { label: "m", value: time.m },
          { label: "s", value: time.s },
        ].map(({ label, value }, i) => (
          <span key={label} className="flex items-center gap-1">
            {i > 0 && <span className="text-orange-400/60 font-bold">:</span>}
            <span className="inline-flex flex-col items-center">
              <span className="font-mono font-bold text-white text-lg leading-none px-2 py-1 rounded-lg"
                style={{ background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.3)" }}>
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
