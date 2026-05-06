"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    category: "Streaming",
    color: "#fbbf24",
    items: ["Netflix", "Spotify Premium", "Disney+", "IPTV", "Crunchyroll"],
  },
  {
    category: "AI Tools",
    color: "#f59e0b",
    items: ["ChatGPT Plus", "Claude Pro", "Midjourney", "Gemini Advanced"],
  },
  {
    category: "Software",
    color: "#d97706",
    items: ["Canva Pro", "Adobe CC", "CapCut Pro", "Wondershare"],
  },
  {
    category: "Gaming",
    color: "#fde68a",
    items: ["Robux", "Xbox Game Pass", "Steam Keys", "Minecraft"],
  },
];

export default function AnimatedSubtitle() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setItemIdx((prev) => {
          const nextItem = prev + 1;
          if (nextItem >= SLIDES[slideIdx].items.length) {
            setSlideIdx((s) => (s + 1) % SLIDES.length);
            return 0;
          }
          return nextItem;
        });
        setVisible(true);
      }, 350);
    }, 2000);
    return () => clearInterval(interval);
  }, [slideIdx]);

  const slide = SLIDES[slideIdx];

  return (
    <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
      Get{" "}
      <span
        className="font-bold transition-all duration-300 inline-block"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-6px)",
          color: slide.color,
        }}>
        {slide.items[itemIdx]}
      </span>
      {" "}and more{" "}
      <span className="font-semibold text-white">at the best price</span>
      {" "}— delivered to your inbox in seconds.
    </p>
  );
}
