"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Zap, Shield, Star, Users, Package, Sparkles, Clock } from "lucide-react";
import AnimatedSubtitle from "./AnimatedSubtitle";

// Animated counter that counts up from 0 to target
function Counter({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setValue(target);
              clearInterval(timer);
            } else {
              setValue(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.2) 0%, transparent 65%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 85% 80%, rgba(217,119,6,0.08) 0%, transparent 50%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 35% at 10% 60%, rgba(251,191,36,0.05) 0%, transparent 50%)" }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-[0.04] blur-3xl" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full opacity-[0.04] blur-3xl" style={{ background: "radial-gradient(circle, #d97706, transparent)" }} />

      {/* Floating badges */}
      {[
        { icon: Zap, text: "Instant Delivery", pos: "top-28 left-8 lg:left-16", delay: 0 },
        { icon: Shield, text: "Secure & Encrypted", pos: "top-40 right-8 lg:right-20", delay: 0.4 },
        { icon: Star, text: "4.7★ Rated", pos: "bottom-40 right-12 lg:right-28", delay: 0.8 },
        { icon: Users, text: "Affiliate Program", pos: "bottom-52 left-8 lg:left-20", delay: 1.2 },
      ].map((badge) => (
        <motion.div key={badge.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ opacity: { delay: badge.delay, duration: 0.5 }, y: { delay: badge.delay, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className={`absolute ${badge.pos} hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300`}
          style={{ background: "rgba(17,13,0,0.9)", border: "1px solid rgba(245,158,11,0.2)", backdropFilter: "blur(12px)" }}>
          <badge.icon size={12} style={{ color: "#f59e0b" }} />
          {badge.text}
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.28)", color: "#fcd34d" }}>
            <Sparkles size={12} style={{ color: "#f59e0b" }} />
            Your Premium Digital Marketplace
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="text-white">Premium </span>
          <span style={{ background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Subscriptions
          </span>
          <br />
          <span className="text-white">At </span>
          <span style={{ background: "linear-gradient(135deg, #fbbf24 0%, #d97706 60%, #92400e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Unbeatable Prices
          </span>
        </motion.h1>

        {/* Animated subtitle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <AnimatedSubtitle />
        </motion.div>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-black text-base transition-all duration-200 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #fbbf24, #d97706)", boxShadow: "0 4px 28px rgba(245,158,11,0.45)" }}>
            <Package size={18} /> Browse Products <ArrowRight size={16} />
          </Link>
          <Link href="/deals"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-300 text-base transition-all duration-200 hover:-translate-y-1 hover:text-white"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.28)", backdropFilter: "blur(8px)" }}>
            <Zap size={16} style={{ color: "#f59e0b" }} /> Today&apos;s Deals
          </Link>
        </motion.div>

        {/* Animated stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-14">
          {[
            { target: 50, suffix: "+", label: "Products", icon: Package },
            { target: 4.7, suffix: "★", label: "Avg Rating", icon: Star, decimals: 1 },
            { target: 100, suffix: "%", label: "Instant", icon: Zap },
            { target: 24, suffix: "/7", label: "Support", icon: Clock },
          ].map(({ target, suffix, label, icon: Icon, decimals }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #fde68a, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <Icon size={20} />
                <Counter target={target} suffix={suffix} decimals={decimals} />
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
    </section>
  );
}
