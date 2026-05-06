"use client";

import { Tv, Bot, Package, Gamepad2, LayoutGrid } from "lucide-react";

export type CategoryOption = "ALL" | "STREAMING" | "AI_TOOLS" | "SOFTWARE" | "GAMING";

interface CategoryNavProps {
  active: CategoryOption;
  onClick: (category: CategoryOption) => void;
}

const categories: { id: CategoryOption; label: string; icon: React.ReactNode }[] = [
  { id: "ALL", label: "All", icon: <LayoutGrid size={15} /> },
  { id: "STREAMING", label: "Streaming", icon: <Tv size={15} /> },
  { id: "AI_TOOLS", label: "AI Tools", icon: <Bot size={15} /> },
  { id: "SOFTWARE", label: "Software", icon: <Package size={15} /> },
  { id: "GAMING", label: "Gaming", icon: <Gamepad2 size={15} /> },
];

export default function CategoryNav({ active, onClick }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onClick(cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            active === cat.id
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-none"
              : "glass-card text-gray-400 hover:text-white hover:border-amber-500/30"
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
