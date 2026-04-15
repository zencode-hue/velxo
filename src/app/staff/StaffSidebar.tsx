"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import VelxoLogo from "@/components/VelxoLogo";
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active ? "text-white bg-[#ea580c]/20 border border-[#ea580c]/30" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                  <Icon size={15} className={active ? "text-[#f97316]" : ""} />
                  {label}
                  {alert && <div className="ml-auto w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
                  {active && !alert && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />}
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
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
        <VelxoLogo size={26} />
        <div>
          <span className="font-bold text-white text-sm block leading-tight">Staff Portal</span>
          <span className="text-xs text-orange-400">Velxo</span>
        </div>
      </div>

      {/* Staff identity */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{staffName}</p>
            <p className="text-xs text-gray-500 truncate">{staffPosition ?? "Staff Member"}</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" title="Online" />
        </div>
      </div>

      <NavLinks onClick={onLinkClick} />

      <div className="p-4 border-t border-white/5 shrink-0 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
          <ExternalLink size={12} /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-400/5">
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-white/5 bg-[#110d06] flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#110d06]">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <VelxoLogo size={22} />
        <span className="font-bold text-white text-sm">Staff Portal</span>
        <span className="ml-auto text-xs text-gray-500">{currentLabel}</span>
      </div>
      <div className="lg:hidden h-14" />

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-50 h-full">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/5">
              <span className="font-bold text-white text-sm">Staff Portal</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
