"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MetraMartLogo from "@/components/MetraMartLogo";
import {
  LayoutDashboard, ShoppingCart, Package, AlertTriangle,
  Menu, LogOut, ExternalLink, Users, User, X,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/staff/orders", label: "Orders", icon: ShoppingCart },
      { href: "/staff/pending-stock", label: "Pending Stock", icon: AlertTriangle, alert: true },
      { href: "/staff/products", label: "Products", icon: Package },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/staff/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/staff/profile", label: "My Profile", icon: User },
    ],
  },
];

export default function StaffSidebar({ staffName, staffPosition }: { staffName: string; staffPosition?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/staff/logout", { method: "POST" });
    router.push("/staff-login");
  }

  const initials = staffName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const currentLabel = navGroups.flatMap((g) => g.items).find((n) => pathname === n.href || (n.href !== "/staff" && pathname.startsWith(n.href)))?.label ?? "Staff";

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 mb-1">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon, alert }) => {
              const active = pathname === href || (href !== "/staff" && pathname.startsWith(href));
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
                  {alert && <div style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: "#fbbf24", animation: "pulse 2s infinite" }} />}
                  {active && !alert && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa" }} />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <MetraMartLogo size={26} />
        <div>
          <span className="font-bold text-white text-sm block leading-tight">Staff Portal</span>
          <span className="text-xs" style={{ color: "#a78bfa" }}>MetraMart</span>
        </div>
      </div>

      {/* Staff identity */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{staffName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{staffPosition ?? "Staff Member"}</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
      </div>

      <NavLinks onClick={onLinkClick} />

      <div className="p-4 shrink-0 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" target="_blank" className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.3)" }}>
          <ExternalLink size={12} /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.3)" }}>
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed h-full z-30"
        style={{ background: "rgba(6,6,6,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(6,6,6,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <button onClick={() => setOpen(true)} style={{ color: "rgba(255,255,255,0.5)" }}>
          <Menu size={20} />
        </button>
        <MetraMartLogo size={22} />
        <span className="font-bold text-white text-sm">Staff Portal</span>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{currentLabel}</span>
      </div>
      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <aside className="relative w-72 flex flex-col z-50 h-full"
            style={{ background: "rgba(6,6,6,0.98)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="font-bold text-white text-sm">Staff Portal</span>
              <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
