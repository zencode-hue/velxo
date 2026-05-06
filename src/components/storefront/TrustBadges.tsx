import { Zap, Shield, RefreshCw, Clock, Star, Lock } from "lucide-react";

const badges = [
  { icon: Zap, label: "Instant Delivery", desc: "Automated, no waiting" },
  { icon: Shield, label: "Secure Payments", desc: "Encrypted & safe" },
  { icon: Lock, label: "AES-256 Encrypted", desc: "All credentials secured" },
  { icon: RefreshCw, label: "Replacement Guarantee", desc: "Invalid? We replace it" },
  { icon: Clock, label: "24/7 Support", desc: "Always available" },
  { icon: Star, label: "4.7★ Rated", desc: "Verified by customers" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-white/5 py-6" style={{ background: "rgba(10,8,0,0.5)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div key={b.label} className="flex flex-col items-center text-center gap-1.5 py-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <b.icon size={16} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{b.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
