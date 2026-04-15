"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[13px] font-medium transition-all duration-150"
        style={{
          padding: "6px 10px",
          borderRadius: "12px",
          color: "rgba(255,255,255,0.55)",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: "1px solid transparent",
        }}
      >
        <span>{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown size={12} style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(8,8,8,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(40px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency…"
                className="bg-transparent outline-none text-sm text-white placeholder-white/30 flex-1 min-w-0"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-64 p-1.5">
            {filtered.length === 0 ? (
              <p className="text-center text-xs py-4" style={{ color: "rgba(255,255,255,0.3)" }}>No results</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: c.code === currency ? "rgba(167,139,250,0.12)" : "transparent",
                    border: c.code === currency ? "1px solid rgba(167,139,250,0.2)" : "1px solid transparent",
                  }}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">{c.code}</span>
                    <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>{c.name}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{c.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
