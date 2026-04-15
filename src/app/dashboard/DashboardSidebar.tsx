"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import VelxoLogo from "@/components/VelxoLogo";
import {
  LayoutDashboard, ShoppingBag, Wallet, Users, Handshake,
  Menu, ExternalLink, Star, Settings, X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/affiliate", label: "Promo Affiliate", icon: Users },
  { href: "/dashboard/partner", label: "Partner Program", icon: Handshake },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link key={href} href={href} onClick={onClick}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 500,
              transition: "all 0.15s ease",
              color: active ? "#fff" : "rgba(255,255,255,0.4)",
              background: active ? "rgba(255,255,255,0.08)" : "transparent",
              border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            }}>
            <Icon size={15} style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            {label}
            {active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa" }} />}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <VelxoLogo size={26} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      </div>
      <NavLinks onClick={onLinkClick} />
      <div className="p-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" className="flex items-center gap-2 text-xs transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
          <ExternalLink size={12} /> Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed h-full z-30"
        style={{ background: "rgba(6,6,6,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(6,6,6,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <button onClick={() => setOpen(true)} style={{ color: "rgba(255,255,255,0.5)" }}>
          <Menu size={20} />
        </button>
        <VelxoLogo size={22} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <aside className="relative w-72 flex flex-col z-50 h-full"
            style={{ background: "rgba(6,6,6,0.98)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="font-bold text-white text-sm">My Account</span>
              <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
