import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, UserCheck, Settings, Zap,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Analytics", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/5 bg-[#0d0d0d] flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/5">
          <Zap size={18} className="text-purple-500" />
          <span className="font-bold gradient-text">Velxo Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
