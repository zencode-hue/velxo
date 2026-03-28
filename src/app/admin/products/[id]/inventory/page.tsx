"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Upload, Download, Package, ArrowLeft, RefreshCw, FileText } from "lucide-react";

interface StockInfo {
  stockCount: number;
  unlimitedStock: boolean;
  available: number;
  delivered: number;
}

export default function AdminInventoryPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loadingStock, setLoadingStock] = useState(true);
  const [tab, setTab] = useState<"paste" | "file">("paste");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStock = useCallback(async () => {
    setLoadingStock(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setStockInfo(data.data);
      }
    } finally {
      setLoadingStock(false);
    }
  }, [productId]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string ?? "");
      setTab("paste");
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (!text.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ Imported ${data.data.imported} item(s) successfully.`);
        setText("");
        fetchStock();
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch {
      setStatus("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    window.open(`/api/admin/products/${productId}/inventory/export`, "_blank");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package size={22} className="text-purple-400" /> Inventory Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Upload credentials or license keys — one per line.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStock} className="btn-secondary text-sm px-3 py-2">
            <RefreshCw size={14} className={loadingStock ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} className="btn-secondary text-sm px-5 py-2 gap-2">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Stock summary */}
      {stockInfo && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stockInfo.unlimitedStock ? "∞" : stockInfo.stockCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Stock</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stockInfo.available}</div>
            <div className="text-xs text-gray-500 mt-1">Available Keys</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stockInfo.delivered}</div>
            <div className="text-xs text-gray-500 mt-1">Delivered</div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        {/* Tab switcher */}
        <div className="flex gap-2 p-1 rounded-lg bg-white/5 w-fit">
          <button onClick={() => setTab("paste")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "paste" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Paste Text
          </button>
          <button onClick={() => setTab("file")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === "file" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
            Upload File
          </button>
        </div>

        {tab === "file" ? (
          <div>
            <input ref={fileRef} type="file" accept=".txt,.csv" onChange={handleFileChange} className="hidden" />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-purple-600/40 hover:bg-purple-600/5 transition-all">
              <FileText size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Click to select a .txt or .csv file</p>
              <p className="text-xs text-gray-600 mt-1">One credential per line</p>
            </div>
            {text && (
              <p className="text-xs text-green-400 mt-2">
                ✅ File loaded — {text.split("\n").filter((l) => l.trim()).length} lines ready to upload
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-2">
              Paste credentials / license keys (one per line)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder={"user1@example.com:password123\nuser2@example.com:password456\nLICENSE-KEY-XXXX"}
              className="input-field font-mono text-sm resize-y"
            />
          </div>
        )}

        {status && (
          <p className={`text-sm ${status.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{status}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !text.trim()}
            className="btn-primary text-sm px-6 py-2.5 gap-2"
          >
            <Upload size={15} />
            {loading ? "Uploading..." : "Upload Stock"}
          </button>
          <p className="text-xs text-gray-600">
            Each line = one inventory item. Encrypted at rest with AES-256-GCM.
          </p>
        </div>
      </div>
    </div>
  );
}
