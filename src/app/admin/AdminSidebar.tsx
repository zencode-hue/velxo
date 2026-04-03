"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import VelxoLogo from "@/components/VelxoLogo";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, UserCheck, Settings, Zap, Menu,
  TrendingUp, ExternalLink, FileText, BarChart2,
  AlertTriangle, Webhook, ClipboardList, Mail,
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
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/email", label: "Email Center", icon: Mail },
  { href: "/admin/webhook-logs", label: "Webhook Logs", icon: Webhook },
  { href: "/admin/audit-log", label: "Audit Log", icon: ClipboardList },
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active
                ? "text-white bg-[#ea580c]/20 border border-[#ea580c]/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            <Icon size={16} className={active ? "text-[#f97316]" : ""} />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />}
          </Link>
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
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-white/5 bg-[#110d06] flex-col fixed h-full z-30">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
          <VelxoLogo size={28} />
          <span className="font-bold text-white">Velxo Shop</span>
          <TrendingUp size={14} className="text-accent ml-auto" />
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-4 border-t border-white/5 shrink-0">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors">
            <ExternalLink size={12} /> View Store
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#110d06]">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ea580c, #fbbf24)" }}>
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Velxo Shop</span>
        </div>
        <span className="ml-auto text-xs text-gray-500">{currentLabel}</span>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-50 h-full">
            <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ea580c, #fbbf24)" }}>
                <Zap size={12} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">Velxo Admin</span>
            </div>
            <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            <div className="p-4 border-t border-white/5 shrink-0">
              <Link href="/" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors">
                <ExternalLink size={12} /> View Store
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

