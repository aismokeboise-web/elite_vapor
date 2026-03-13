"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ListingFilters } from "@/components/ListingFilters";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton } from "@/components/Skeleton";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; categoryId: string };
type Product = {
  id: string;
  name: string;
  brand: { id: string; name: string; category: Category };
  models: { id: string; name: string; price: string; imageUrls: string[] }[];
};

const PAGE_SIZE = 12;

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [modelId, setModelId] = useState("");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(() => {
    if (!BACKEND) return;
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    fetch(`${BACKEND}/api/products/featured?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [search, categoryId, brandId]);

  useEffect(() => {
    if (!BACKEND) return;
    fetch(`${BACKEND}/api/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => []);
    fetch(`${BACKEND}/api/brands`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, brandId, minPrice, maxPrice, modelId]);

  const parsedMin = minPrice.trim() === "" ? undefined : Number(minPrice);
  const parsedMax = maxPrice.trim() === "" ? undefined : Number(maxPrice);

  const filteredProducts = products.filter((p) => {
    if (!parsedMin && !parsedMax && !modelId) return true;
    const models = p.models || [];
    return models.some((m) => {
      const priceNum = Number(m.price);
      if (!Number.isFinite(priceNum)) return false;
      if (parsedMin !== undefined && priceNum < parsedMin) return false;
      if (parsedMax !== undefined && priceNum > parsedMax) return false;
      if (modelId && m.id !== modelId) return false;
      return true;
    });
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col bg-slate-100">
      <section className="w-full border-b border-violet-300 bg-gradient-to-r from-indigo-100 via-slate-50 to-violet-200 py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Featured products
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Hand-picked products our team and customers love the most.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <ListingFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          brandId={brandId}
          onBrandChange={setBrandId}
          categories={categories}
          brands={brands}
          placeholder="Search featured…"
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          modelId={modelId}
          onModelChange={setModelId}
          models={products.flatMap((p) => p.models.map((m) => ({ id: m.id, name: m.name })))}
        />

        {!loading && (
          <p className="mt-4 text-sm font-medium text-slate-600">
            {filteredProducts.length === 0
              ? "0 products"
              : `Showing ${paginatedProducts.length} of ${products.length} ${
                  products.length === 1 ? "product" : "products"
                }`}
          </p>
        )}

        {loading ? (
          <div className="mt-8">
            <CardGridSkeleton />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
            <p className="text-slate-500">No featured products yet.</p>
            <Link href="/products" className="mt-4 inline-block font-medium text-slate-700 hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i} />
              ))}
            </div>
            {filteredProducts.length > PAGE_SIZE && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

