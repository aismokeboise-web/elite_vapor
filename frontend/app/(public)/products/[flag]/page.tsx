"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ListingFilters } from "@/components/ListingFilters";
import { CardGridSkeleton } from "@/components/Skeleton";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

const FLAG_MAP: Record<string, { param: string; title: string; description: string }> = {
  clearance: {
    param: "is_clearance",
    title: "Clearance",
    description: "Great products at reduced prices. Limited stock—grab them while they last.",
  },
  deals: {
    param: "is_deal",
    title: "Deals",
    description: "Limited-time offers and exclusive deals on selected products.",
  },
  "best-sellers": {
    param: "is_best_seller",
    title: "Best Sellers",
    description: "Customer favorites and top picks, always in demand.",
  },
  new: {
    param: "is_new",
    title: "New Arrivals",
    description: "Fresh picks—newly added products and latest drops.",
  },
};

type Category = { id: string; name: string };
type Brand = { id: string; name: string; categoryId: string };
type Product = {
  id: string;
  name: string;
  brand: { id: string; name: string; category: Category };
  models: { id: string; name: string; price: string; imageUrls: string[] }[];
};

export default function ProductsByFlagPage() {
  const params = useParams();
  const flagSlug = params.flag as string;
  const config = FLAG_MAP[flagSlug];
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

  const fetchProducts = useCallback(() => {
    if (!config || !BACKEND) return;
    const q = new URLSearchParams();
    q.set(config.param, "1");
    if (search.trim()) q.set("search", search.trim());
    if (categoryId) q.set("categoryId", categoryId);
    if (brandId) q.set("brandId", brandId);
    fetch(`${BACKEND}/api/products?${q}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [config?.param, search, categoryId, brandId]);

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

  const gradientClass =
    flagSlug === "deals"
      ? "from-fuchsia-100 via-slate-50 to-fuchsia-200"
      : flagSlug === "clearance"
      ? "from-amber-100 via-slate-50 to-amber-200"
      : flagSlug === "best-sellers"
      ? "from-indigo-100 via-slate-50 to-indigo-200"
      : flagSlug === "new"
      ? "from-sky-100 via-slate-50 to-indigo-100"
      : "from-slate-100 via-slate-50 to-slate-200";

  if (!config) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-4 lg:px-6">
        <p className="text-slate-600">Page not found.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-slate-700 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-100">
      <section
        className={`w-full border-b border-slate-200 bg-gradient-to-r ${gradientClass} py-8 sm:py-10`}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {config.title}
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            {config.description}
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
              : `Showing ${filteredProducts.length} of ${products.length} ${
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
            <p className="text-slate-500">No products in this section yet.</p>
            <Link href="/" className="mt-4 inline-block font-medium text-slate-700 hover:underline">
              Browse home
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
