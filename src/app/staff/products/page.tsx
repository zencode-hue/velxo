import { db } from "@/lib/db";
import { requireStaff } from "@/lib/staff-auth";
import { Package } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  STREAMING: "Streaming", AI_TOOLS: "AI Tools", SOFTWARE: "Software", GAMING: "Gaming",
};

export default async function StaffProductsPage() {
  await requireStaff();

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, price: true, stockCount: true, isActive: true, unlimitedStock: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Package size={22} className="text-amber-400" /> Products
        <span className="text-sm font-normal text-gray-500 ml-2">({products.length})</span>
      </h1>

      <div className="glass-card overflow-x-auto">
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
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-5 py-3 text-white font-medium truncate max-w-[200px]">{p.title}</td>
                <td className="px-5 py-3"><span className="badge-purple">{CATEGORY_LABELS[p.category] ?? p.category}</span></td>
                <td className="px-5 py-3 text-right text-white">${Number(p.price).toFixed(2)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={p.unlimitedStock ? "text-amber-400 text-xs" : p.stockCount > 0 ? "text-green-400" : "text-red-400"}>
                    {p.unlimitedStock ? "∞" : p.stockCount}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={p.isActive ? "badge-green" : "badge-red"}>{p.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/staff/inventory/${p.id}`} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    Add Stock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center text-gray-600 py-12">No products found.</p>}
      </div>
    </div>
  );
}
