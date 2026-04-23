"use client";

import { useParams } from "next/navigation";
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

type Category = { id: string; name: string; slug?: string | null; iconPath?: string | null };
type Brand = { id: string; name: string; categoryId: string };
type Product = {
  id: string;
  name: string;
  slug?: string | null;
  brand: { id: string; name: string; category: Category };
  models: { id: string; name: string; price: string; imageUrls: string[] }[];
};

const PAGE_SIZE = 12;

function getCategoryGradient(name: string): string {
  const key = name.toLowerCase();
  if (key.includes("disposable")) return "border-rose-200 bg-gradient-to-r from-rose-100 via-slate-50 to-amber-100";
  if (key.includes("accessor")) return "border-indigo-200 bg-gradient-to-r from-indigo-100 via-slate-50 to-sky-100";
  if (key.includes("pod") || key.includes("device")) return "border-emerald-200 bg-gradient-to-r from-emerald-100 via-slate-50 to-teal-100";
  if (key.includes("nicotine") || key.includes("pouch")) return "border-amber-200 bg-gradient-to-r from-amber-100 via-slate-50 to-orange-100";
  if (key.includes("e-liquid") || key.includes("liquid") || key.includes("juice")) return "border-violet-200 bg-gradient-to-r from-violet-100 via-slate-50 to-fuchsia-100";
  if (key.includes("kit") || key.includes("starter")) return "border-sky-200 bg-gradient-to-r from-sky-100 via-slate-50 to-cyan-100";
  return "border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-200";
}

export function CategoryClient({ id }: { id: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [modelId, setModelId] = useState("");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(() => {
    if (!id || !BACKEND) return;
    const q = new URLSearchParams();
    q.set("categoryId", id);
    if (search.trim()) q.set("search", search.trim());
    if (brandId) q.set("brandId", brandId);
    fetch(`${BACKEND}/api/products?${q}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [id, search, brandId]);

  useEffect(() => {
    if (!id || !BACKEND) return;
    Promise.all([
      fetch(`${BACKEND}/api/categories/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${BACKEND}/api/categories`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${BACKEND}/api/brands?categoryId=${id}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cat, cats, b]) => {
        setCategory(cat);
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(b) ? b : []);
      })
      .catch(() => { setCategory(null); setCategories([]); setBrands([]); });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search, brandId, id, minPrice, maxPrice, modelId]);

  const parsedMin = minPrice.trim() === "" ? undefined : Number(minPrice);
  const parsedMax = maxPrice.trim() === "" ? undefined : Number(maxPrice);

  const filteredProducts = products.filter((p) => {
    if (!parsedMin && !parsedMax && !modelId) return true;
    return p.models.some((m) => {
      const priceNum = Number(m.price);
      if (!Number.isFinite(priceNum)) return false;
      if (parsedMin !== undefined && priceNum < parsedMin) return false;
      if (parsedMax !== undefined && priceNum > parsedMax) return false;
      if (modelId && m.id !== modelId) return false;
      return true;
    });
  });

  if (!id) return null;

  if (loading && !category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-slate-600">No products found for this category.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-slate-700 hover:underline">Browse home</Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col bg-slate-100">
      <section className={`w-full py-8 sm:py-10 border-b ${getCategoryGradient(category.name)}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {category.name}
          </h1>
          <p className="text-sm text-slate-600">
            {category.name} — Elite Vapor Vape and Smoke, Boise Idaho
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <ListingFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={id}
          onCategoryChange={() => {}}
          brandId={brandId}
          onBrandChange={setBrandId}
          categories={categories}
          brands={brands}
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
              : `Showing ${paginatedProducts.length} of ${products.length} ${products.length === 1 ? "product" : "products"}`}
          </p>
        )}

        {loading ? (
          <div className="mt-8"><CardGridSkeleton /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm">
              <h2 className="mt-4 text-lg font-semibold text-slate-900">No products in this category yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;re still adding items. Browse all products or explore other sections.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/products" className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  Browse all products
                </Link>
                <Link href="/" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i} />
              ))}
            </div>
            {products.length > PAGE_SIZE && (
              <Pagination currentPage={page} totalPages={totalPages} totalItems={products.length} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
