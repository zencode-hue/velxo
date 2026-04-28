"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantEditor, { type VariantDraft } from "@/components/admin/VariantEditor";

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
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  const [form, setFormState] = useState({
    title: "", description: "", price: "",
    category: "STREAMING", imageUrl: "",
    isActive: true, unlimitedStock: true, stockCount: "0",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/products/${id}`).then((r) => r.json()),
      fetch(`/api/admin/products/${id}/variants`).then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([productData, variantData]) => {
      const p = productData.data?.product ?? productData.data;
      if (p) {
        setFormState({
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
      const vArr = variantData.data ?? [];
      setVariants(vArr.map((v: { id: string; name: string; price: number; unlimitedStock: boolean; stockCount: number; isActive: boolean }) => ({
        id: v.id,
        name: v.name,
        price: String(v.price),
        unlimitedStock: v.unlimitedStock,
        stockCount: String(v.stockCount),
        isActive: v.isActive,
      })));
    }).finally(() => setFetching(false));
  }, [id]);

  function set(field: string, value: string | boolean) {
    setFormState((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stockCount: parseInt(form.stockCount, 10) }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Failed to update product"); setLoading(false); return; }

    // Save variants
    const variantPayload = variants.map((v, i) => ({
      ...(v.id ? { id: v.id } : {}),
      name: v.name,
      price: parseFloat(v.price) || 0,
      unlimitedStock: v.unlimitedStock,
      stockCount: parseInt(v.stockCount) || 0,
      isActive: v.isActive,
      sortOrder: i,
    }));
    await fetch(`/api/admin/products/${id}/variants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variantPayload),
    });

    setLoading(false);
    router.push("/admin/products");
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { router.push("/admin/products"); }
    else { const d = await res.json(); setErr(d.error ?? "Failed to delete"); setConfirmDelete(false); }
  }

  if (fetching) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        </div>
        <button type="button" onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="glass-card p-5 mb-6 border border-red-500/30">
          <p className="text-sm text-white mb-4">Delete this product? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors">
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              required className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Base Price (USD)</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                required min="0" step="0.01" className="input-field" />
              <p className="text-xs text-gray-600 mt-1">Used when no variants are set</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input-field">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />

          <div className="space-y-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm font-medium text-white">Base Stock</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.unlimitedStock}
                onChange={(e) => set("unlimitedStock", e.target.checked)} className="w-4 h-4 accent-purple-500" />
              <span className="text-sm text-gray-400">Unlimited stock</span>
            </label>
            {!form.unlimitedStock && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Stock Count</label>
                <input type="number" value={form.stockCount} onChange={(e) => set("stockCount", e.target.value)}
                  min="0" className="input-field w-40" />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-purple-500" />
            <span className="text-sm text-gray-400">Active (visible in store)</span>
          </label>
        </div>

        {/* Variants */}
        <div className="glass-card p-6">
          <VariantEditor variants={variants} onChange={setVariants} />
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <div className="flex gap-3">
          <Link href="/admin/products" className="btn-secondary flex-1 py-2.5 text-sm text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
