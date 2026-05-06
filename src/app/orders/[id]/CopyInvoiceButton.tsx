"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyInvoiceButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
      {copied ? <><Check size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}
