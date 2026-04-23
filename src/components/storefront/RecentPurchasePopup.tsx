"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X, CheckCircle } from "lucide-react";

// Non-African countries only, by country name
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland",
  "Japan", "South Korea", "Singapore", "New Zealand", "Ireland",
  "Spain", "Italy", "Portugal", "Belgium", "Austria", "Finland",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait",
  "Brazil", "Mexico", "Argentina", "Chile", "Colombia",
  "India", "Malaysia", "Thailand", "Philippines", "Indonesia",
  "Turkey", "Israel", "Poland", "Czech Republic", "Hungary",
];

const TIMES = ["just now", "1 min ago", "2 min ago", "3 min ago", "5 min ago", "8 min ago", "12 min ago"];

interface Popup {
  country: string;
  product: string;
  time: string;
}

interface Props {
  products: Array<{ title: string }>;
  enabled?: boolean;
}

export default function RecentPurchasePopup({ products, enabled = true }: Props) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || products.length === 0) return;

    function showPopup() {
      const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const product = products[Math.floor(Math.random() * products.length)].title;
      const time = TIMES[Math.floor(Math.random() * TIMES.length)];
      setPopup({ country, product, time });
      setVisible(true);
      setTimeout(() => setVisible(false), 5500);
    }

    // First popup after 10s, then every 30s
    const first = setTimeout(showPopup, 10000);
    const interval = setInterval(showPopup, 30000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [enabled, products]);

  if (!popup) return null;

  return (
    <div
      className="fixed bottom-5 left-4 z-50 max-w-[280px] transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="flex items-start gap-3 p-3.5 rounded-2xl"
        style={{
          background: "rgba(8,8,8,0.96)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
        >
          <CheckCircle size={16} style={{ color: "#34d399" }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white leading-tight">
            Someone just bought
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.7)" }}>
            {popup.product}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              from {popup.country}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {popup.time}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 mt-0.5 transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
