"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, Search, User, Zap, ShoppingBag, ShoppingCart } from "lucide-react";
import VelxoLogo from "@/components/VelxoLogo";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/storefront/CartDrawer";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/deals", label: "Deals" },
  { href: "/blog", label: "Blog" },
  { href: "/affiliate", label: "Affiliate" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { count } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Cart drawer — rendered at top level so it's always in the DOM */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Navbar pill */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4">
        <header
          style={{
            width: "100%",
            maxWidth: 960,
            background: scrolled ? "rgba(6,6,6,0.92)" : "rgba(255,255,255,0.04)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 20,
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            transition: "all 0.4s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56 }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              <VelxoLogo size={22} />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.3px" }}>Velxo</span>
            </Link>

            {/* Desktop nav */}
            <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      background: active ? "rgba(255,255,255,0.09)" : "transparent",
                      border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Search */}
              <Link
                href="/search"
                aria-label="Search"
                style={{
                  padding: 8,
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <Search size={17} />
              </Link>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                aria-label={`Cart${count > 0 ? ` (${count} items)` : ""}`}
                style={{
                  position: "relative",
                  padding: 8,
                  borderRadius: 10,
                  background: count > 0 ? "rgba(167,139,250,0.12)" : "transparent",
                  border: count > 0 ? "1px solid rgba(167,139,250,0.25)" : "1px solid transparent",
                  color: count > 0 ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <ShoppingCart size={17} />
                {count > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 100,
                      background: "#a78bfa",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                    }}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Dashboard / Sign in — desktop only */}
              {session ? (
                <Link
                  href="/dashboard"
                  className="hidden sm:flex"
                  style={{
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <User size={13} /> Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex"
                  style={{
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <User size={13} /> Sign In
                </Link>
              )}

              {/* Shop CTA — desktop only */}
              <Link
                href="/products"
                className="hidden sm:flex"
                style={{
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#fff",
                  background: "rgba(167,139,250,0.15)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: "0 0 16px rgba(167,139,250,0.12)",
                }}
              >
                <Zap size={12} /> Shop
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden"
                aria-label="Menu"
                style={{
                  padding: 8,
                  borderRadius: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer */}
      <div style={{ height: 80 }} />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 39, paddingTop: 80, paddingLeft: 16, paddingRight: 16 }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}
          />
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(10,10,10,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", padding: 12, gap: 2 }}>
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                      color: active ? "#fff" : "rgba(255,255,255,0.55)",
                      background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* Cart in mobile menu */}
              <button
                onClick={() => { setMobileOpen(false); setCartOpen(true); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <ShoppingCart size={15} />
                Cart
                {count > 0 && (
                  <span style={{
                    marginLeft: "auto",
                    background: "#a78bfa",
                    color: "#fff",
                    borderRadius: 100,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

              {session ? (
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none", color: "rgba(255,255,255,0.6)" }}>
                  <User size={14} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none", color: "rgba(255,255,255,0.6)" }}>
                    <User size={14} /> Sign In
                  </Link>
                  <Link href="/auth/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", color: "#fff", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", marginTop: 4 }}>
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
