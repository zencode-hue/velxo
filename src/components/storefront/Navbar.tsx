"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import VelxoLogo from "@/components/VelxoLogo";
import { Menu, X, Search, User, Zap } from "lucide-react";

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
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0b0f]/95 backdrop-blur-xl border-b border-[#1e2535]/80 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg shrink-0">
              <VelxoLogo size={26} />
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Velxo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? "text-white bg-blue-500/15 border border-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/search"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Search">
                <Search size={18} />
              </Link>

              {session ? (
                <Link href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <User size={15} /> Dashboard
                </Link>
              ) : (
                <Link href="/auth/login"
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <User size={15} /> Sign In
                </Link>
              )}

              <Link href="/products"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
                }}>
                <Zap size={14} /> Shop Now
              </Link>

              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Toggle menu">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" />

      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex flex-col pt-16">
          <div className="absolute inset-0 bg-[#0a0b0f]/98 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <nav className="relative z-10 flex flex-col p-4 space-y-1 border-b border-[#1e2535]">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white bg-blue-500/15 border border-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 space-y-2">
              {session ? (
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <User size={15} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <User size={15} /> Sign In
                  </Link>
                  <Link href="/auth/register"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}