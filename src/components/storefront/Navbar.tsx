"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import VelxoLogo from "@/components/VelxoLogo";
import { Menu, X, Search, User, Zap, ShoppingBag } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/deals", label: "Deals" },
  { href: "/blog", label: "Blog" },
  { href: "/affiliate", label: "Affiliate" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <header
          className="w-full max-w-5xl transition-all duration-500"
          style={{
            background: scrolled
              ? "rgba(8,8,8,0.85)"
              : "rgba(255,255,255,0.04)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "20px",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between px-5 h-14">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <VelxoLogo size={24} />
              <span className="font-bold text-base text-white tracking-tight">Velxo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      color: active ? "#fff" : "rgba(248,250,252,0.5)",
                      background: active ? "rgba(255,255,255,0.09)" : "transparent",
                      border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    }}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/search"
                className="p-2 rounded-xl transition-all duration-150"
                style={{ color: "rgba(248,250,252,0.5)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(248,250,252,0.5)"; }}
                aria-label="Search">
                <Search size={17} />
              </Link>

              {session ? (
                <Link href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{ color: "rgba(248,250,252,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <User size={14} /> Dashboard
                </Link>
              ) : (
                <Link href="/auth/login"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{ color: "rgba(248,250,252,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <User size={14} /> Sign In
                </Link>
              )}

              <Link href="/products"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 relative overflow-hidden"
                style={{
                  background: "rgba(167,139,250,0.15)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: "0 0 20px rgba(167,139,250,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}>
                <Zap size={13} /> Shop
              </Link>

              <button onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-xl transition-all"
                style={{ color: "rgba(248,250,252,0.6)" }}
                aria-label="Menu">
                {open ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </header>
      </div>

      <div className="h-20" />

      {open && (
        <div className="md:hidden fixed inset-0 z-40 pt-20 px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: "rgba(12,12,12,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)" }}>
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: active ? "#fff" : "rgba(248,250,252,0.55)",
                      background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    }}>
                    {label}
                  </Link>
                );
              })}
              <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
              {session ? (
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "rgba(248,250,252,0.6)" }}>
                  <User size={14} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "rgba(248,250,252,0.6)" }}>
                    <User size={14} /> Sign In
                  </Link>
                  <Link href="/auth/register"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white mt-1"
                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
                    <ShoppingBag size={14} /> Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}