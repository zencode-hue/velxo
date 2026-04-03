"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0"
      style={{
        background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: copied ? "#34d399" : "#9ca3af",
      }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {label ? (copied ? "Copied!" : label) : (copied ? "Copied!" : "Copy")}
    </button>
  );
}
