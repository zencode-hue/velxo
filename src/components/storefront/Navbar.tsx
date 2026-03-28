"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X, Zap, ChevronDown, Tv, Bot, Package, Gamepad2, Globe, Search, Heart } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "GHS"];

const categories = [
  { href: "/products?category=STREAMING", label: "Streaming", icon: Tv, color: "text-red-400" },
  { href: "/products?category=AI_TOOLS", label: "AI Tools", icon: Bot, color: "text-blue-400" },
  { href: "/products?category=SOFTWARE", label: "Software", icon: Package, color: "text-green-400" },
  { href: "/products?category=GAMING", label: "Gaming", icon: Gamepad2, color: "text-purple-400" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [currOpen, setCurrOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  }

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setSearchOpen(false)}>
          <form onSubmit={handleSearch} className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchRef} value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl text-white outline-none"
                style={{ background: "rgba(17,17,17,0.98)", border: "1px solid rgba(124,58,237,0.4)" }} />
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Press Enter to search · Esc to close</p>
          </form>
        </div>
      )}

      <header className="sticky top-0 z-50" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
              <Zap size={16} className="text-white" />
            </div>
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Velxo
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <Link href="/" className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Home</Link>

            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                Products <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl p-2 shadow-2xl z-50" style={{ background: "rgba(13,13,13,0.99)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Package size={14} className="text-purple-400" /> All Products
                  </Link>
                  <div className="my-1 border-t border-white/5" />
                  {categories.map((cat) => (
                    <Link key={cat.href} href={cat.href} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                      <cat.icon size={14} className={cat.color} /> {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/deals" className="px-3 py-2 text-sm text-orange-400 hover:text-orange-300 rounded-lg hover:bg-orange-500/5 transition-all font-medium">🔥 Deals</Link>
            <Link href="/blog" className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Blog</Link>
            <Link href="/affiliate" className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Affiliates</Link>
            <Link href="/support" className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Support</Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all" title="Search">
              <Search size={18} />
            </button>

            <Link href="/wishlist" className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all" title="Wishlist">
              <Heart size={18} />
            </Link>

            <div className="relative">
              <button onClick={() => setCurrOpen(!currOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all border border-white/8">
                <Globe size={12} /> {currency} <ChevronDown size={11} />
              </button>
              {currOpen && (
                <div className="absolute top-full right-0 mt-1 w-28 rounded-xl p-1.5 shadow-xl z-50" style={{ background: "rgba(13,13,13,0.99)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {CURRENCIES.map((c) => (
                    <button key={c} onClick={() => { setCurrency(c); setCurrOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all ${currency === c ? "text-purple-400 bg-purple-600/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {session ? (
              <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">Sign In</Link>
                <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-400 hover:text-white">
              <Search size={20} />
            </button>
            <button className="text-gray-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 px-4 py-4 space-y-1" style={{ background: "rgba(10,10,10,0.99)" }}>
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "All Products" },
              { href: "/products?category=STREAMING", label: "📺 Streaming" },
              { href: "/products?category=AI_TOOLS", label: "🤖 AI Tools" },
              { href: "/products?category=SOFTWARE", label: "💻 Software" },
              { href: "/products?category=GAMING", label: "🎮 Gaming" },
              { href: "/deals", label: "🔥 Hot Deals" },
              { href: "/blog", label: "📝 Blog" },
              { href: "/affiliate", label: "💰 Affiliates" },
              { href: "/support", label: "💬 Support" },
              { href: "/wishlist", label: "❤️ Wishlist" },
            ].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              {session ? (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold text-white text-center py-3 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="text-sm text-center py-3 rounded-xl text-gray-300 border border-white/10 hover:bg-white/5 transition-all">
                    Sign In
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                    className="text-sm font-semibold text-white text-center py-3 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
