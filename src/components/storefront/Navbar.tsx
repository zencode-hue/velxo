"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/products#categories", label: "Categories" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap size={20} className="text-purple-500" />
          <span className="gradient-text">Velxo</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm px-5 py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-400 hover:text-white transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            {session ? (
              <Link href="/dashboard" className="btn-primary text-sm text-center">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-sm text-center">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
