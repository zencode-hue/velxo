"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Download, Package } from "lucide-react";

export default function AdminInventoryPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package size={22} className="text-purple-400" /> Inventory Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Upload credentials or license keys — one per line.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm px-5 py-2 gap-2">
          <Download size={15} /> Export
        </button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <label className="block text-sm text-gray-400 font-medium">
          Paste credentials / license keys (one per line)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={"user1@example.com:password123\nuser2@example.com:password456\nLICENSE-KEY-XXXX"}
          className="input-field font-mono text-sm resize-y"
        />
        {status && (
          <p className={`text-sm ${status.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{status}</p>
        )}
        <button
          onClick={handleUpload}
          disabled={loading || !text.trim()}
          className="btn-primary text-sm px-6 py-2.5 gap-2"
        >
          <Upload size={15} />
          {loading ? "Uploading..." : "Upload Stock"}
        </button>
      </div>
    </div>
  );
}
