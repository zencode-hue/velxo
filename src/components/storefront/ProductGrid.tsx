"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CategoryNav, { type CategoryOption } from "./CategoryNav";
import ProductCard, { type ProductCardProps } from "./ProductCard";

interface ProductGridProps {
  products: ProductCardProps[];
  initialCategory?: CategoryOption;
}

export default function ProductGrid({
  products,
  initialCategory = "ALL",
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryOption>(initialCategory);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (
        search.trim() &&
        !p.title.toLowerCase().includes(search.trim().toLowerCase())
      )
        return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [products, activeCategory, search, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Search + filter toggle */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`btn-secondary text-sm px-4 py-3 gap-2 ${showFilters ? "border-amber-500/60" : ""}`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Price filters */}
      {showFilters && (
        <div className="glass-card p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Min Price ($)</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-field w-32 text-sm py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Max Price ($)</label>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-field w-32 text-sm py-2"
            />
          </div>
          <button
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Category nav */}
      <CategoryNav active={activeCategory} onClick={setActiveCategory} />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
