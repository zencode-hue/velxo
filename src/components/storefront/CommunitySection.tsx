import Link from "next/link";
import { MessageCircle, Send, Users, Zap } from "lucide-react";

interface Props {
  discordUrl: string;
  telegramUrl?: string;
}

export default function CommunitySection({ discordUrl, telegramUrl }: Props) {
  if (!discordUrl && !telegramUrl) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(88,101,242,0.08) 0%, transparent 60%)" }} />
        {telegramUrl && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(0,136,204,0.06) 0%, transparent 60%)" }} />
        )}

        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Users size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Join Our Community
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Get Support & Exclusive Deals
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Join thousands of members. Get instant support, early access to deals, and community perks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {discordUrl && (
                <Link href={discordUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #5865f2, #7289da)",
                    boxShadow: "0 4px 20px rgba(88,101,242,0.3)",
                  }}>
                  <MessageCircle size={16} />
                  Join Discord
                </Link>
              )}
              {telegramUrl && (
                <Link href={telegramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #0088cc, #00a8e8)",
                    boxShadow: "0 4px 20px rgba(0,136,204,0.3)",
                  }}>
                  <Send size={16} />
                  Join Telegram
                </Link>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-6 pt-6 flex-wrap justify-center sm:justify-start"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { icon: Users, value: "10,000+", label: "Members" },
              { icon: Zap, value: "Instant", label: "Support" },
              { icon: MessageCircle, value: "24/7", label: "Active" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-sm font-bold text-white">{s.value}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
