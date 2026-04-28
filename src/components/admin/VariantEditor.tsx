"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface VariantDraft {
  id?: string;
  name: string;
  price: string;
  unlimitedStock: boolean;
  stockCount: string;
  isActive: boolean;
}

interface Props {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}

export default function VariantEditor({ variants, onChange }: Props) {
  function add() {
    onChange([...variants, { name: "", price: "", unlimitedStock: true, stockCount: "0", isActive: true }]);
  }

  function remove(i: number) {
    onChange(variants.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof VariantDraft, value: string | boolean) {
    const next = variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Product Variants</p>
          <p className="text-xs text-gray-500 mt-0.5">e.g. Individual / Family / 1 Month / 1 Year — each with its own price</p>
        </div>
        <button type="button" onClick={add}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/10">
          <Plus size={13} /> Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-gray-600 py-3 text-center rounded-xl border border-dashed border-white/10">
          No variants — product uses its base price. Add variants to offer multiple options.
        </p>
      )}

      {variants.map((v, i) => (
        <div key={i} className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-600 shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Variant Name</label>
                <input value={v.name} onChange={(e) => update(i, "name", e.target.value)}
                  placeholder="e.g. Individual, Family, 1 Month"
                  className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price (USD)</label>
                <input type="number" value={v.price} onChange={(e) => update(i, "price", e.target.value)}
                  placeholder="9.99" min="0" step="0.01"
                  className="input-field text-sm py-2" />
              </div>
            </div>
            <button type="button" onClick={() => remove(i)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4 pl-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={v.unlimitedStock}
                onChange={(e) => update(i, "unlimitedStock", e.target.checked)}
                className="w-3.5 h-3.5 accent-purple-500" />
              <span className="text-xs text-gray-400">Unlimited stock</span>
            </label>
            {!v.unlimitedStock && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Stock:</label>
                <input type="number" value={v.stockCount}
                  onChange={(e) => update(i, "stockCount", e.target.value)}
                  min="0" className="input-field text-xs py-1 w-20" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <input type="checkbox" checked={v.isActive}
                onChange={(e) => update(i, "isActive", e.target.checked)}
                className="w-3.5 h-3.5 accent-purple-500" />
              <span className="text-xs text-gray-400">Active</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
