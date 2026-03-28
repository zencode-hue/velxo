import { Shield, Zap, RefreshCw, Lock, Clock, Star } from "lucide-react";

const badges = [
  { icon: Zap, label: "Instant Delivery", desc: "Automated, no waiting", color: "text-yellow-400" },
  { icon: Shield, label: "Secure Payments", desc: "Encrypted & safe", color: "text-green-400" },
  { icon: Lock, label: "AES-256 Encrypted", desc: "All credentials secured", color: "text-blue-400" },
  { icon: RefreshCw, label: "Replacement Guarantee", desc: "Invalid? We replace it", color: "text-purple-400" },
  { icon: Clock, label: "24/7 Availability", desc: "Shop anytime", color: "text-cyan-400" },
  { icon: Star, label: "Verified Products", desc: "Quality guaranteed", color: "text-orange-400" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-white/5 py-8" style={{ background: "rgba(17,17,17,0.4)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b) => (
            <div key={b.label} className="flex flex-col items-center text-center gap-2 py-2">
              <b.icon size={22} className={b.color} />
              <div>
                <p className="text-xs font-semibold text-white">{b.label}</p>
                <p className="text-xs text-gray-600">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
