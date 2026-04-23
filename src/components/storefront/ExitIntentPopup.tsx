"use client";

import { useEffect, useState } from "react";
import { X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("exit_popup_dismissed")) return;

    let triggered = false;

    function handleMouseLeave(e: MouseEvent) {
      if (triggered || dismissed) return;
      if (e.clientY <= 10) {
        triggered = true;
        setShow(true);
      }
    }

    // Mobile: show after 45s of inactivity
    const mobileTimer = setTimeout(() => {
      if (!triggered && !dismissed) {
        triggered = true;
        setShow(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [dismissed]);

  function dismiss() {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("exit_popup_dismissed", "1");
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={dismiss}>
      <div
        className="relative w-full max-w-md rounded-3xl p-8 text-center"
        style={{
          background: "rgba(10,10,10,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={dismiss} className="absolute top-4 right-4 transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <Zap size={24} style={{ color: "#c4b5fd" }} />
        </div>

        <h2 className="text-2xl font-black text-white mb-2">Wait — Don&apos;t Leave!</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          Get instant access to premium digital products at the best prices. Delivered in seconds.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: "⚡", label: "Instant Delivery" },
            { value: "🔒", label: "Secure Payment" },
            { value: "💰", label: "Best Prices" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xl mb-1">{s.value}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <Link href="/products" onClick={dismiss}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm"
          style={{
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.3)",
            boxShadow: "0 0 24px rgba(167,139,250,0.15)",
          }}>
          Browse Products <ArrowRight size={15} />
        </Link>

        <button onClick={dismiss} className="mt-3 text-xs transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          No thanks, I&apos;ll pass
        </button>
      </div>
    </div>
  );
}
