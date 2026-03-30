"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.06) 0%, transparent 50%)" }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.3)" }}>
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
        <p className="text-gray-400 mb-2">Your order has been confirmed.</p>
        <p className="text-sm text-gray-500 mb-6">Check your email for delivery details. Credentials are delivered instantly.</p>

        {orderId && (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(17,17,17,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-gray-500 mb-1">Order Reference</p>
            <p className="font-mono text-sm text-white">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={`/orders/${orderId}`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>
              <Package size={16} /> View Invoice
            </Link>
          )}
          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm border border-white/10 hover:bg-white/5 transition-all">
            My Orders <ArrowRight size={16} />
          </Link>
          <Link href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-400 hover:text-white text-sm border border-white/8 hover:border-white/20 transition-all">
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}

