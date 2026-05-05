"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MetraMartLogo fr@/components/MetraMartLogoMartLogo";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, UserCheck, Settings, Menu,
  TrendingUp, ExternalLink, FileText, BarChart2,
  AlertTriangle, Webhook, ClipboardList, Mail, Search,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Invoices", icon: ShoppingCart },
  { href: "/admin/pending-stock", label: "Pending Stock", icon: AlertTriangle },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
  { href: "/admin/partners", label: "Partners", icon: TrendingUp },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/email", label: "Email Center", icon: Mail },
  { href: "/admin/webhook-logs", label: "Webhook Logs", icon: Webhook },
  { href: "/admin/audit-log", label: "Audit Log", icon: ClipboardList },
  { href: "/admin/ip-lookup", label: "IP Lookup", icon: Search },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/setup", label: "Setup", icon: Settings },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
            {active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa" }} />}          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const currentLabel = navItems.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? "Admin";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed h-full z-30"
        style={{ background: "rgba(6,6,6,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <div className="h-16 flex items-center gap-2.5 px-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <MetraMartLogo size={26} />
          <span className="font-bold text-white text-sm">MetraMart</span>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.2)" }}>ADMIN</span>
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
            <ExternalLink size={12} /> View Store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(6,6,6,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}>
        <button onClick={() => setOpen(true)} className="transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
          <Menu size={20} />
        </button>
        <MetraMartLogo size={22} />
        <span className="font-bold text-white text-sm">MetraMart Admin</span>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{currentLabel}</span>
      </div>

      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col z-50 h-full"
            style={{ background: "rgba(6,6,6,0.98)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="h-14 flex items-center gap-2.5 px-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <MetraMartLogo size={22} />
              <span className="font-bold text-white text-sm">MetraMart Admin</span>
            </div>
            <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            <div className="p-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <Link href="/" className="flex items-center gap-2 text-xs transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                <ExternalLink size={12} /> View Store
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

