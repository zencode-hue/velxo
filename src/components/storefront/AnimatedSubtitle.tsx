"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    category: "Streaming",
    color: "#60a5fa",
    items: ["Netflix", "Spotify", "DAZN", "Crunchyroll", "Disney+"],
  },
  {
    category: "AI Tools",
    color: "#818cf8",
    items: ["ChatGPT Plus", "Gemini Advanced", "Midjourney", "Claude Pro"],
  },
  {
    category: "Software",
    color: "#fb923c",
    items: ["Wondershare", "Canva Pro", "CapCut Pro", "Adobe CC"],
  },
  {
    category: "Gaming",
    color: "#f59e0b",
    items: ["Robux", "Minecraft", "Xbox Game Pass", "Steam Keys"],
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
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, [slideIdx]);

  const slide = SLIDES[slideIdx];

  return (
    <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
      We sell{" "}
      <span className="font-semibold" style={{ color: slide.color }}>
        {slide.category}
      </span>{" "}
      like{" "}
      <span
        className="font-bold text-white transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          display: "inline-block",
          color: slide.color,
        }}>
        {slide.items[itemIdx]}
      </span>
      {" "}— instant delivery, no waiting.
    </p>
  );
}
