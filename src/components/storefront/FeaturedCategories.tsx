"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tv, Bot, Package, Gamepad2, ArrowRight } from "lucide-react";

const categories = [
  { id: "STREAMING", label: "Streaming", desc: "Netflix, Spotify, Disney+ and more", icon: Tv, color: "from-amber-500/20 to-yellow-500/10", iconColor: "text-amber-400" },
  { id: "AI_TOOLS", label: "AI Tools", desc: "ChatGPT, Midjourney, and top AI subs", icon: Bot, color: "from-yellow-500/20 to-amber-500/10", iconColor: "text-yellow-400" },
  { id: "SOFTWARE", label: "Software", desc: "Licenses for productivity & creative tools", icon: Package, color: "from-orange-500/20 to-amber-500/10", iconColor: "text-orange-400" },
  { id: "GAMING", label: "Gaming", desc: "Game keys, credits, and subscriptions", icon: Gamepad2, color: "from-amber-600/20 to-orange-500/10", iconColor: "text-amber-500" },
];

export default function FeaturedCategories() {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Browse by Category</h2>
        <p className="text-gray-500">Find exactly what you need</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={`/products?category=${cat.id}`}
              className="glass-card-hover p-6 flex flex-col gap-4 group h-full">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                <cat.icon size={26} className={cat.iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">{cat.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400 group-hover:gap-2 transition-all">
                Browse <ArrowRight size={12} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
