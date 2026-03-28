"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

const CATEGORIES = [
  { value: "STREAMING", label: "Streaming" },
  { value: "AI_TOOLS", label: "AI Tools" },
  { value: "SOFTWARE", label: "Software" },
  { value: "GAMING", label: "Gaming" },
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "STREAMING",
    imageUrl: "",
    isActive: true,
    unlimitedStock: true,
    stockCount: "0",
  });

  useEffect(() => {
    fetch(`/api/v1/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.data?.product ?? data.data;
        if (p) {
          setForm({
            title: p.title ?? "",
            description: p.description ?? "",
            price: String(p.price ?? ""),
            category: p.category ?? "STREAMING",
            imageUrl: p.imageUrl ?? "",
            isActive: p.isActive ?? true,
            unlimitedStock: p.unlimitedStock ?? true,
            stockCount: String(p.stockCount ?? 0),
          });
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stockCount: parseInt(form.stockCount, 10),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data.error ?? "Failed to update product");
      return;
    }

    router.push("/admin/products");
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json();
      setErr(data.error ?? "Failed to delete product");
      setConfirmDelete(false);
    }
  }

  if (fetching) {
    return <div className="text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="glass-card p-5 mb-6 border border-red-500/30">
          <p className="text-sm text-white mb-4">Are you sure you want to delete this product? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors">
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
            required className="input-field" placeholder="e.g. Netflix Premium 1 Month" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={3} className="input-field resize-none" placeholder="Product description…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Price (USD)</label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
              required min="0" step="0.01" className="input-field" placeholder="9.99" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Image URL (optional)</label>
          <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
            className="input-field" placeholder="https://…" />
        </div>

        {/* Stock settings */}
        <div className="space-y-3 p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-sm font-medium text-white">Stock Settings</p>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="unlimitedStock" checked={form.unlimitedStock}
              onChange={(e) => set("unlimitedStock", e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <label htmlFor="unlimitedStock" className="text-sm text-gray-400">
              Unlimited stock (no inventory required)
            </label>
          </div>

          {!form.unlimitedStock && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Stock Count</label>
              <input type="number" value={form.stockCount} onChange={(e) => set("stockCount", e.target.value)}
                min="0" step="1" className="input-field w-40" placeholder="0" />
              <p className="text-xs text-gray-600 mt-1">Set manually or use the Inventory page to upload keys.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-purple-500" />
          <label htmlFor="isActive" className="text-sm text-gray-400">Active (visible in store)</label>
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-3 pt-2">
          <Link href="/admin/products" className="btn-secondary flex-1 py-2.5 text-sm text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
