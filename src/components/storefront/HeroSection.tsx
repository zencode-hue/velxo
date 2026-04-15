"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Star, Users, Package, Sparkles } from "lucide-react";
import AnimatedSubtitle from "./AnimatedSubtitle";

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 85% 80%, rgba(99,102,241,0.1) 0%, transparent 50%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 35% at 10% 60%, rgba(56,189,248,0.06) 0%, transparent 50%)" }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />

      {/* Floating badges */}
      {[
        { icon: Zap, text: "Instant Delivery", pos: "top-28 left-8 lg:left-16", delay: 0 },
        { icon: Shield, text: "Secure & Encrypted", pos: "top-40 right-8 lg:right-20", delay: 0.4 },
        { icon: Star, text: "10k+ Customers", pos: "bottom-40 right-12 lg:right-28", delay: 0.8 },
        { icon: Users, text: "Affiliate Program", pos: "bottom-52 left-8 lg:left-20", delay: 1.2 },
      ].map((badge) => (
        <motion.div key={badge.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ opacity: { delay: badge.delay, duration: 0.5 }, y: { delay: badge.delay, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className={`absolute ${badge.pos} hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300`}
          style={{ background: "rgba(17,19,24,0.9)", border: "1px solid rgba(59,130,246,0.25)", backdropFilter: "blur(12px)" }}>
          <badge.icon size={12} className="text-blue-400" />
          {badge.text}
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
            <Sparkles size={12} className="text-blue-400" />
            Premium Digital Marketplace
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="text-white">Digital </span>
          <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Products
          </span>
          <br />
          <span className="text-white">Delivered </span>
          <span style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Instantly
          </span>
        </motion.h1>

        <AnimatedSubtitle />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 24px rgba(59,130,246,0.4)" }}>
            <Package size={18} /> Browse Products <ArrowRight size={16} />
          </Link>
          <Link href="/deals"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-300 text-base transition-all duration-200 hover:-translate-y-1 hover:text-white"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", backdropFilter: "blur(8px)" }}>
            <Zap size={16} className="text-blue-400" /> View Deals
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {[
            { value: "500+", label: "Products", icon: Package },
            { value: "10k+", label: "Customers", icon: Users },
            { value: "100%", label: "Instant", icon: Zap },
            { value: "24/7", label: "Support", icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <Icon size={20} /> {value}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0a0b0f)" }} />
    </section>
  );
}
