import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { Tag } from "lucide-react";
import CreateDiscountForm from "./CreateDiscountForm";

export default async function AdminDiscountsPage() {
  await requireAdmin();

  const codes = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, type: true, value: true, usageCount: true, usageLimit: true, expiresAt: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Tag size={22} className="text-purple-400" /> Discount Codes
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CreateDiscountForm />

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white">Existing Codes</h2>
          </div>
          {codes.length === 0 ? (
            <p className="text-center text-gray-600 py-10">No discount codes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Value</th>
                  <th className="text-right px-4 py-3">Used</th>
                  <th className="text-left px-4 py-3">Expires</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-3 font-mono text-purple-300">{c.code}</td>
                    <td className="px-4 py-3 text-gray-400">{c.type}</td>
                    <td className="px-4 py-3 text-right text-white">
                      {c.type === "PERCENTAGE" ? `${Number(c.value)}%` : `$${Number(c.value).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">{c.usageCount}/{c.usageLimit}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(c.expiresAt) < new Date()
                        ? <span className="text-red-400">Expired</span>
                        : new Date(c.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
