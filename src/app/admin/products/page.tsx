import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Plus, Package } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, price: true, stockCount: true, isActive: true, avgRating: true, unlimitedStock: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm px-5 py-2 gap-2">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Package size={40} className="mx-auto mb-4 opacity-30" />
          <p>No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Stock</th>
                <th className="text-center px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 text-white font-medium truncate max-w-[200px]">{p.title}</td>
                  <td className="px-5 py-3"><span className="badge-purple">{CATEGORY_LABELS[p.category] ?? p.category}</span></td>
                  <td className="px-5 py-3 text-right text-white">${Number(p.price).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={p.unlimitedStock ? "text-blue-400 text-xs" : p.stockCount > 0 ? "text-green-400" : "text-red-400"}>
                      {p.unlimitedStock ? "∞" : p.stockCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={p.isActive ? "badge-green" : "badge-red"}>{p.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</Link>
                      <Link href={`/admin/products/${p.id}/inventory`} className="text-xs text-gray-400 hover:text-white transition-colors">Inventory</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
