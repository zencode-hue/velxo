"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Star, Users, Package } from "lucide-react";
import { useEffect, useRef } from "react";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.4 + 0.1,
      });
    }
    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(88, 101, 242, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 70% at 50% -5%, rgba(88,101,242,0.2) 0%, transparent 55%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 90%, rgba(0,212,255,0.06) 0%, transparent 50%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 40% at 10% 60%, rgba(88,101,242,0.06) 0%, transparent 50%)" }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <ParticleCanvas />

      {[
        { icon: Zap, text: "Instant Delivery", color: "text-yellow-300", delay: 0, pos: "top-28 left-8 lg:left-16", y: [-6, 6] },
        { icon: Shield, text: "Secure & Encrypted", color: "text-green-400", delay: 0.5, pos: "top-40 right-8 lg:right-20", y: [6, -6] },
        { icon: Star, text: "10k+ Happy Customers", color: "text-yellow-400", delay: 1, pos: "bottom-40 right-12 lg:right-28", y: [-4, 8] },
        { icon: Users, text: "Affiliate Program", color: "text-blue-400", delay: 1.5, pos: "bottom-52 left-8 lg:left-20", y: [4, -8] },
      ].map((badge) => (
        <motion.div key={badge.text}
          animate={{ y: badge.y }}
          transition={{ duration: 4 + badge.delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: badge.delay }}
          className={`absolute ${badge.pos} hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-white`}
          style={{ background: "rgba(26,27,35,0.9)", border: "1px solid rgba(88,101,242,0.25)", backdropFilter: "blur(12px)" }}>
          <badge.icon size={13} className={badge.color} />
          {badge.text}
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.35)", color: "#7289da" }}>
            <Sparkles size={13} />
            #1 Premium Digital Marketplace
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="text-white">Digital </span>
          <span style={{ background: "linear-gradient(135deg, #00d4ff 0%, #7289da 40%, #5865f2 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Products
          </span>
          <br />
          <span className="text-white">Delivered </span>
          <span style={{ background: "linear-gradient(135deg, #5865f2 0%, #7289da 50%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Instantly
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Streaming subscriptions, AI tools, software licenses, and gaming products.
          Automated delivery to your inbox. No waiting, no hassle.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: "linear-gradient(135deg, #5865f2, #7289da)", boxShadow: "0 4px 24px rgba(88,101,242,0.45)" }}>
            <Package size={18} /> Browse Products <ArrowRight size={16} />
          </Link>
          <Link href="/deals"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200 hover:-translate-y-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
            Hot Deals
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {[
            { value: "500+", label: "Products", icon: Package },
            { value: "10k+", label: "Customers", icon: Users },
            { value: "100%", label: "Instant", icon: Zap },
            { value: "24/7", label: "Support", icon: Shield },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #7289da, #5865f2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <Icon size={22} /> {value}
              </div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0e0f14)" }} />
    </section>
  );
}
