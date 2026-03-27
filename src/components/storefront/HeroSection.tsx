"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

const floatingVariants = {
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const floatingVariants2 = {
  animate: {
    y: [8, -8, 8],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Purple glow background */}
      <div className="absolute inset-0 bg-purple-glow opacity-60 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Floating elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-24 left-16 hidden lg:flex items-center gap-2 glass-card px-4 py-2 text-sm text-purple-400"
      >
        <Zap size={14} className="text-purple-400" />
        Instant Delivery
      </motion.div>

      <motion.div
        variants={floatingVariants2}
        animate="animate"
        className="absolute top-32 right-20 hidden lg:flex items-center gap-2 glass-card px-4 py-2 text-sm text-purple-400"
      >
        <Shield size={14} className="text-purple-400" />
        Secure Payments
      </motion.div>

      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-32 left-24 hidden lg:flex items-center gap-2 glass-card px-4 py-2 text-sm text-purple-400"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles size={14} className="text-purple-400" />
        Premium Products
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-purple mb-6 inline-flex items-center gap-1.5">
            <Sparkles size={12} />
            Premium Digital Marketplace
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
        >
          Your Digital{" "}
          <span className="gradient-text text-glow">Products</span>
          <br />
          Delivered Instantly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Browse streaming subscriptions, AI tools, software licenses, and
          gaming products. Automated delivery straight to your inbox — no
          waiting, no hassle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/products" className="btn-primary text-base px-8 py-4">
            Browse Products
            <ArrowRight size={18} />
          </Link>
          <Link href="/products#categories" className="btn-secondary text-base px-8 py-4">
            View Categories
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { label: "Products", value: "500+" },
            { label: "Happy Customers", value: "10k+" },
            { label: "Instant Delivery", value: "100%" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
