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
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link key={href} href={href} onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active ? "text-white bg-[#ea580c]/20 border border-[#ea580c]/30" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            <Icon size={16} className={active ? "text-[#f97316]" : ""} />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
        <VelxoLogo size={28} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      </div>
      <NavLinks onClick={onLinkClick} />
      <div className="p-4 border-t border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors">
          <ExternalLink size={12} /> Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-[#110d06] flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#110d06]">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
        <VelxoLogo size={22} />
        <span className="font-bold text-white text-sm">My Account</span>
      </div>
      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-50 h-full">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/5">
              <span className="font-bold text-white text-sm">My Account</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
