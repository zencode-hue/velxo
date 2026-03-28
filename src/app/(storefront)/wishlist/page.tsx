"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Package } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";

interface Product {
  id: string; title: string; price: number; category: string;
  imageUrl: string | null; avgRating: number; stockCount: number;
  unlimitedStock: boolean; inStock: boolean;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("velxo_wishlist") ?? "[]") as string[];
    if (ids.length === 0) { setLoading(false); return; }

    Promise.all(ids.map((id) => fetch(`/api/v1/products/${id}`).then((r) => r.json())))
      .then((results) => {
        const prods = results.map((r) => r.data?.product ?? r.data).filter(Boolean).map((p: Product) => ({
          ...p, price: Number(p.price), avgRating: Number(p.avgRating),
          inStock: p.unlimitedStock || p.stockCount > 0,
        }));
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-red-400 fill-red-400" />
        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
        {products.length > 0 && <span className="text-sm text-gray-500">({products.length} items)</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <div key={i} className="rounded-xl bg-[#111] h-64 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-2">Your wishlist is empty</p>
          <p className="text-sm mb-6">Save products you love by clicking the heart icon</p>
          <Link href="/products" className="btn-primary text-sm px-6 py-2.5">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
}
