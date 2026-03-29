"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Link, ImageIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Product Image" }: Props) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setConverting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setConverting(false);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { processFile(file); return; }
      }
    }
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 w-fit mb-3">
        <button type="button" onClick={() => setTab("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === "upload" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <Upload size={12} /> Upload / Paste
        </button>
        <button type="button" onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === "url" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <Link size={12} /> URL
        </button>
      </div>

      {tab === "url" ? (
        <input
          type="text"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input-field text-sm"
        />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${dragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-purple-600/40 hover:bg-white/3"}`}
          style={{ minHeight: "120px" }}
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {value && !converting ? (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image src={value} alt="Product" fill className="object-cover" sizes="400px" />
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors">
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              {converting ? (
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ImageIcon size={28} className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-400 font-medium">Click, drag & drop, or paste image</p>
                    <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {value && tab === "upload" && !value.startsWith("data:") && (
        <p className="text-xs text-gray-600 mt-1">Currently using URL. Switch to Upload tab to replace with a file.</p>
      )}
    </div>
  );
}
