"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import VelxoLogo from "@/components/VelxoLogo";
import { LayoutDashboard, ShoppingCart, Package, AlertTriangle, Menu, LogOut, ExternalLink } from "lucide-react";

const navItems = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/orders", label: "Orders", icon: ShoppingCart },
  { href: "/staff/products", label: "Products", icon: Package },
  { href: "/staff/pending-stock", label: "Pending Stock", icon: AlertTriangle },
];

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/staff" && pathname.startsWith(href));
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

export default function StaffSidebar({ staffName }: { staffName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/staff/logout", { method: "POST" });
    router.push("/staff-login");
  }

  const currentLabel = navItems.find((n) => pathname === n.href || (n.href !== "/staff" && pathname.startsWith(n.href)))?.label ?? "Staff";

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
        <VelxoLogo size={28} />
        <div>
          <span className="font-bold text-white text-sm block">Staff Portal</span>
          <span className="text-xs text-gray-500">{staffName}</span>
        </div>
      </div>
      <NavLinks pathname={pathname} onClick={onLinkClick} />
      <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors">
          <ExternalLink size={12} /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition-colors w-full">
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-white/5 bg-[#110d06] flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#110d06]">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <VelxoLogo size={22} />
          <span className="font-bold text-white text-sm">Staff Portal</span>
        </div>
        <span className="ml-auto text-xs text-gray-500">{currentLabel}</span>
      </div>

      <div className="lg:hidden h-14" />

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-50 h-full">
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
