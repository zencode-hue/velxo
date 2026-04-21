"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

const NAMES = ["Alex", "Jordan", "Sam", "Chris", "Taylor", "Morgan", "Riley", "Casey", "Jamie", "Drew"];
const LOCATIONS = ["London", "Lagos", "New York", "Dubai", "Toronto", "Sydney", "Berlin", "Paris", "Tokyo", "Accra"];
const TIMES = ["2 min ago", "5 min ago", "8 min ago", "12 min ago", "just now", "3 min ago"];

interface Popup {
  name: string;
  location: string;
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
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const product = products[Math.floor(Math.random() * products.length)].title;
      const time = TIMES[Math.floor(Math.random() * TIMES.length)];
      setPopup({ name, location, product, time });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }

    // First popup after 8s, then every 25s
    const first = setTimeout(showPopup, 8000);
    const interval = setInterval(showPopup, 25000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [enabled, products]);

  if (!popup) return null;

  return (
    <div className={`fixed bottom-6 left-4 z-50 transition-all duration-500 max-w-xs ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="flex items-center gap-3 p-3 rounded-2xl shadow-2xl"
        style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <ShoppingBag size={16} style={{ color: "#c4b5fd" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-medium truncate">
            {popup.name} from {popup.location}
          </p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
            purchased <span className="text-white">{popup.product}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{popup.time}</p>
        </div>
        <button onClick={() => setVisible(false)} className="shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
