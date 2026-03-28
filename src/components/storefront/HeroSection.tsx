"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 60%)" }} />
        <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* Floating badges */}
      <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-28 left-12 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-300"
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", backdropFilter: "blur(8px)" }}>
        <Zap size={14} className="text-yellow-400" /> Instant Delivery
      </motion.div>

      <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-36 right-16 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-300"
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", backdropFilter: "blur(8px)" }}>
        <Shield size={14} className="text-green-400" /> Secure Payments
      </motion.div>

      <motion.div animate={{ y: [-4, 8, -4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-36 right-24 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-300"
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", backdropFilter: "blur(8px)" }}>
        <Star size={14} className="text-yellow-400 fill-yellow-400" /> 10k+ Customers
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-purple-300 mb-8"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <Sparkles size={13} className="text-purple-400" />
            Premium Digital Marketplace
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          <span className="text-white">Your Digital </span>
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Products
          </span>
          <br />
          <span className="text-white">Delivered </span>
          <span style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Instantly
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Streaming subscriptions, AI tools, software licenses, and gaming products.
          Automated delivery straight to your inbox — no waiting, no hassle.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
            Browse Products <ArrowRight size={18} />
          </Link>
          <Link href="#categories"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:border-purple-600/50"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            View Categories
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-10">
          {[
            { value: "500+", label: "Products" },
            { value: "10k+", label: "Happy Customers" },
            { value: "100%", label: "Instant Delivery" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
