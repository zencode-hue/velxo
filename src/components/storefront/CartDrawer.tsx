"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, Trash2, ArrowRight, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, removeItem, clearCart } = useCart();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 998,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          width: "100%",
          maxWidth: 360,
          background: "rgba(8,8,8,0.98)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(40px)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingCart size={18} color="#a78bfa" />
            <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Cart</span>
            {items.length > 0 && (
              <span style={{
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.3)",
                color: "#c4b5fd",
                borderRadius: 100,
                padding: "1px 8px",
                fontSize: 12,
                fontWeight: 600,
              }}>
                {items.length}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <ShoppingCart size={24} color="rgba(167,139,250,0.5)" />
              </div>
              <p style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>Your cart is empty</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20 }}>Add products to get started</p>
              <Link
                href="/products"
                onClick={onClose}
                style={{
                  fontSize: 13,
                  color: "#c4b5fd",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Browse products <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
                      {CAT[item.category] ?? item.category}
                    </p>
                  </div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 6,
                      color: "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Total</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>${total.toFixed(2)}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", marginBottom: 12 }}>
              Digital products are purchased individually
            </p>
            <Link
              href="/cart"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.35)",
                textDecoration: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(167,139,250,0.2)",
              }}
            >
              <Zap size={15} color="#c4b5fd" />
              Checkout — ${total.toFixed(2)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
