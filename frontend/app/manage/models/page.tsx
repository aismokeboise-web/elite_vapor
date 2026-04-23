"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch, getBackendUrl } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton } from "@/components/Skeleton";
import { usePerPage } from "../../../lib/usePerPage";

const MAX_IMAGE_BYTES = 50 * 1024; // 50 kB

/** Placeholder when a model has no image in a slot (frontend public/images/product_placeholder.jpg) */
const PRODUCT_PLACEHOLDER_IMAGE = "/images/product_placeholder.jpg";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; categoryId?: string; category?: { id: string; name: string } };
type Product = { id: string; name: string; brandId?: string; brand?: Brand; size?: string | null; nicotineStrength?: string | null };
type Model = {
  id: string;
  name: string;
  productId: string;
  price: string | number;
  description: string | null;
  flavors?: string[];
  is_clearance?: boolean;
  is_deal?: boolean;
  deal_text?: string | null;
  is_best_seller?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  product?: Product;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

/** Compact, readable date for cards: relative when recent, short date otherwise. */
function formatDateCard(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return "—";
  }
}

export default function ModelsPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Model[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [flavors, setFlavors] = useState("");
  const [is_clearance, setIs_clearance] = useState(false);
  const [is_deal, setIs_deal] = useState(false);
  const [deal_text, setDeal_text] = useState("On Sale");
  const [is_best_seller, setIs_best_seller] = useState(false);
  const [is_new, setIs_new] = useState(false);
  const [is_featured, setIs_featured] = useState(false);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterBrandId, setFilterBrandId] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterNicotineStrength, setFilterNicotineStrength] = useState("");
  const [filterIsClearance, setFilterIsClearance] = useState(false);
  const [filterIsDeal, setFilterIsDeal] = useState(false);
  const [filterIsBestSeller, setFilterIsBestSeller] = useState(false);
  const [filterIsNew, setFilterIsNew] = useState(false);
  const [filterIsFeatured, setFilterIsFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = usePerPage();

  const [image1PreviewUrl, setImage1PreviewUrl] = useState<string | null>(null);
  const [image2PreviewUrl, setImage2PreviewUrl] = useState<string | null>(null);
  const [image3PreviewUrl, setImage3PreviewUrl] = useState<string | null>(null);

  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);
  const image3InputRef = useRef<HTMLInputElement>(null);

  const canCreate = can("model", "create");
  const canUpdate = can("model", "update");
  const canDelete = can("model", "delete");
  const isEdit = editingId != null;

  const sizeOptions = useMemo(() => {
    const values = [...new Set(products.map((p) => p.size).filter((s): s is string => !!s))];
    return values.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const nicotineOptions = useMemo(() => {
    const values = [...new Set(products.map((p) => p.nicotineStrength).filter((s): s is string => !!s))];
    return values.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const modelParams = new URLSearchParams();
      if (search.trim()) modelParams.set("search", search.trim());
      if (filterCategoryId) modelParams.set("categoryId", filterCategoryId);
      if (filterBrandId) modelParams.set("brandId", filterBrandId);
      if (filterProductId) modelParams.set("productId", filterProductId);
      const minVal = priceMin.trim();
      const maxVal = priceMax.trim();
      if (minVal !== "" && !Number.isNaN(Number(minVal))) modelParams.set("priceMin", minVal);
      if (maxVal !== "" && !Number.isNaN(Number(maxVal))) modelParams.set("priceMax", maxVal);
      if (filterSize.trim()) modelParams.set("size", filterSize.trim());
      if (filterNicotineStrength.trim()) modelParams.set("nicotineStrength", filterNicotineStrength.trim());
      if (filterIsClearance) modelParams.set("is_clearance", "1");
      if (filterIsDeal) modelParams.set("is_deal", "1");
      if (filterIsBestSeller) modelParams.set("is_best_seller", "1");
      if (filterIsNew) modelParams.set("is_new", "1");
      if (filterIsFeatured) modelParams.set("is_featured", "1");
      const modelUrl = modelParams.toString() ? `/api/models?${modelParams}` : "/api/models";

      const [catRes, brandRes, productRes, modelRes] = await Promise.all([
        fetchWithAuth("/api/categories"),
        fetchWithAuth("/api/brands"),
        fetchWithAuth("/api/products"),
        fetchWithAuth(modelUrl),
      ]);
      if (!catRes.ok) throw new Error("Failed to load categories");
      if (!brandRes.ok) throw new Error("Failed to load brands");
      if (!productRes.ok) throw new Error("Failed to load products");
      if (!modelRes.ok) throw new Error("Failed to load models");
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      const productData = await productRes.json();
      const modelData = await modelRes.json();
      setCategories(catData);
      setBrands(brandData);
      setProducts(productData);
      setList(modelData);
      setPage(1);
      if (productData.length && !productId) setProductId(productData[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filterCategoryId, filterBrandId, filterProductId, priceMin, priceMax, filterSize, filterNicotineStrength, filterIsClearance, filterIsDeal, filterIsBestSeller, filterIsNew, filterIsFeatured]);

  const totalPages = Math.ceil(list.length / perPage) || 1;
  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    if (image1 && image1.size <= MAX_IMAGE_BYTES) {
      const url = URL.createObjectURL(image1);
      setImage1PreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImage1PreviewUrl(null);
  }, [image1]);

  useEffect(() => {
    if (image2 && image2.size <= MAX_IMAGE_BYTES) {
      const url = URL.createObjectURL(image2);
      setImage2PreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImage2PreviewUrl(null);
  }, [image2]);

  useEffect(() => {
    if (image3 && image3.size <= MAX_IMAGE_BYTES) {
      const url = URL.createObjectURL(image3);
      setImage3PreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImage3PreviewUrl(null);
  }, [image3]);

  useEffect(() => {
    if (!image1 && image1InputRef.current) image1InputRef.current.value = "";
  }, [image1]);
  useEffect(() => {
    if (!image2 && image2InputRef.current) image2InputRef.current.value = "";
  }, [image2]);
  useEffect(() => {
    if (!image3 && image3InputRef.current) image3InputRef.current.value = "";
  }, [image3]);

  const openModal = () => {
    setEditingId(null);
    setName("");
    setProductId(products[0]?.id ?? "");
    setPrice("");
    setDescription("");
    setFlavors("");
    setIs_clearance(false);
    setIs_deal(false);
    setDeal_text("On Sale");
    setIs_best_seller(false);
    setIs_new(false);
    setIs_featured(false);
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setExistingImageUrls(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (m: Model) => {
    setEditingId(m.id);
    setName(m.name);
    setProductId(m.productId ?? products[0]?.id ?? "");
    setPrice(String(m.price));
    setDescription(m.description ?? "");
    setFlavors(Array.isArray(m.flavors) ? m.flavors.join(", ") : "");
    setIs_clearance(!!m.is_clearance);
    setIs_deal(!!m.is_deal);
    setDeal_text(m.deal_text ?? "On Sale");
    setIs_best_seller(!!m.is_best_seller);
    setIs_new(!!m.is_new);
    setIs_featured(!!m.is_featured);
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setExistingImageUrls(m.imageUrls ?? []);
    setError(null);
    setModalOpen(true);
  };

  const validateImageSize = (file: File): string | null => {
    if (file.size > MAX_IMAGE_BYTES) {
      return `${file.name} exceeds 50 kB (${(file.size / 1024).toFixed(1)} kB)`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productId || price === "") return;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) return;

    const files = [image1, image2, image3];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f) {
        const msg = validateImageSize(f);
        if (msg) {
          setError(msg);
          return;
        }
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("productId", productId);
      formData.append("price", String(priceNum));
      formData.append("description", description.trim());
      formData.append("flavors", flavors.trim());
      formData.append("is_clearance", is_clearance ? "1" : "0");
      formData.append("is_deal", is_deal ? "1" : "0");
      formData.append("deal_text", deal_text.trim() || "On Sale");
      formData.append("is_best_seller", is_best_seller ? "1" : "0");
      formData.append("is_new", is_new ? "1" : "0");
      formData.append("is_featured", is_featured ? "1" : "0");
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);

      if (isEdit) {
        const res = await fetchWithAuth(`/api/models/${editingId}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || "Update failed");
        }
      } else {
        const res = await fetchWithAuth("/api/models", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || "Create failed");
        }
      }
      setModalOpen(false);
      setEditingId(null);
      setExistingImageUrls(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : (isEdit ? "Update failed" : "Create failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this model?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/models/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        {/* Top row: Back, Create */}
        <section className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600 hover:underline"
          >
            <svg className="h-4 w-4 shrink-0 transition-colors group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={openModal}
              className="shrink-0 rounded-xl bg-indigo-200 px-5 py-2.5 text-sm font-medium text-indigo-800 shadow-sm transition cursor-pointer hover:bg-indigo-600 hover:text-white sm:w-auto"
            >
              Create
            </button>
          )}
        </section>

        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">All Models</h1>

        {/* Search: always below title */}
        <div>
          <label className="sr-only" htmlFor="model-search">Search by name</label>
          <input
            id="model-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models by name…"
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="model-filter-cat" className="text-sm font-medium text-slate-700">Category</label>
              <select
                id="model-filter-cat"
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-filter-brand" className="text-sm font-medium text-slate-700">Brand</label>
              <select
                id="model-filter-brand"
                value={filterBrandId}
                onChange={(e) => setFilterBrandId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-filter-product" className="text-sm font-medium text-slate-700">Product</label>
              <select
                id="model-filter-product"
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="min-w-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-price-min" className="text-sm font-medium text-slate-700">Price min</label>
              <input
                id="model-price-min"
                type="number"
                step="0.01"
                min="0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-price-max" className="text-sm font-medium text-slate-700">Price max</label>
              <input
                id="model-price-max"
                type="number"
                step="0.01"
                min="0"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-filter-size" className="text-sm font-medium text-slate-700">Size</label>
              <select
                id="model-filter-size"
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="min-w-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All</option>
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="model-filter-nicotine" className="text-sm font-medium text-slate-700">Nicotine</label>
              <select
                id="model-filter-nicotine"
                value={filterNicotineStrength}
                onChange={(e) => setFilterNicotineStrength(e.target.value)}
                className="min-w-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All</option>
                {nicotineOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Flags filter: separate row, larger font, responsive */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700 sm:text-base">Flags</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filterIsClearance}
                onChange={(e) => setFilterIsClearance(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700 sm:text-base">Clearance</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filterIsDeal}
                onChange={(e) => setFilterIsDeal(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-slate-700 sm:text-base">Deal</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filterIsBestSeller}
                onChange={(e) => setFilterIsBestSeller(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700 sm:text-base">Best Seller</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filterIsNew}
                onChange={(e) => setFilterIsNew(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm font-medium text-slate-700 sm:text-base">New</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filterIsFeatured}
                onChange={(e) => setFilterIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-slate-700 sm:text-base">Featured</span>
            </label>
          </div>
        </div>

        {!loading && list.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={list.length}
            onPageChange={setPage}
          />
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit model" : "Create model"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Model name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Give a product description"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Flavors</label>
              <input
                type="text"
                value={flavors}
                onChange={(e) => setFlavors(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Comma-separated, e.g. Mint, Mango, Berry"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Flags</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_clearance}
                    onChange={(e) => setIs_clearance(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Clearance</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_deal}
                    onChange={(e) => setIs_deal(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Deal</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_best_seller}
                    onChange={(e) => setIs_best_seller(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Best Seller</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_new}
                    onChange={(e) => setIs_new(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">New</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_featured}
                    onChange={(e) => setIs_featured(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>
            </div>
            {is_deal && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Deal text</label>
                <input
                  type="text"
                  value={deal_text}
                  onChange={(e) => setDeal_text(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="On Sale"
                />
                <p className="mt-1 text-xs text-slate-500">Shown on product page when Deal is checked. Default: On Sale.</p>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Images (max 50 kB each)</p>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">First image</label>
                <input
                  ref={image1InputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setImage1(f ?? null);
                    if (f) setError(f.size > MAX_IMAGE_BYTES ? `${f.name} exceeds 50 kB` : null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white"
                />
                {(image1 && <p className="mt-1 text-xs text-slate-500">Selected: {image1.name}</p>) || (isEdit && existingImageUrls?.[0] && <p className="mt-1 text-xs text-slate-500">Current: {existingImageUrls[0].replace(/^.*\//, "")}</p>)}
                {image1 && image1.size <= MAX_IMAGE_BYTES && image1PreviewUrl && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img src={image1PreviewUrl} alt="" className="h-20 w-20 rounded-lg object-contain bg-slate-100" />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600" title={image1.name}>{image1.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImage1(null); setError(null); }}
                      className="absolute -right-1 -top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      aria-label="Remove image"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {isEdit && !image1 && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img
                        src={existingImageUrls?.[0] ? `${getBackendUrl()}${existingImageUrls[0]}` : PRODUCT_PLACEHOLDER_IMAGE}
                        alt=""
                        className="h-20 w-20 rounded-lg object-contain bg-slate-100"
                      />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600">Current image 1</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Second image</label>
                <input
                  ref={image2InputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setImage2(f ?? null);
                    if (f) setError(f.size > MAX_IMAGE_BYTES ? `${f.name} exceeds 50 kB` : null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white"
                />
                {(image2 && <p className="mt-1 text-xs text-slate-500">Selected: {image2.name}</p>) || (isEdit && existingImageUrls?.[1] && <p className="mt-1 text-xs text-slate-500">Current: {existingImageUrls[1].replace(/^.*\//, "")}</p>)}
                {image2 && image2.size <= MAX_IMAGE_BYTES && image2PreviewUrl && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img src={image2PreviewUrl} alt="" className="h-20 w-20 rounded-lg object-contain bg-slate-100" />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600" title={image2.name}>{image2.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImage2(null); setError(null); }}
                      className="absolute -right-1 -top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      aria-label="Remove image"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {isEdit && !image2 && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img
                        src={existingImageUrls?.[1] ? `${getBackendUrl()}${existingImageUrls[1]}` : PRODUCT_PLACEHOLDER_IMAGE}
                        alt=""
                        className="h-20 w-20 rounded-lg object-contain bg-slate-100"
                      />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600">Current image 2</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Third image</label>
                <input
                  ref={image3InputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setImage3(f ?? null);
                    if (f) setError(f.size > MAX_IMAGE_BYTES ? `${f.name} exceeds 50 kB` : null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white"
                />
                {(image3 && <p className="mt-1 text-xs text-slate-500">Selected: {image3.name}</p>) || (isEdit && existingImageUrls?.[2] && <p className="mt-1 text-xs text-slate-500">Current: {existingImageUrls[2].replace(/^.*\//, "")}</p>)}
                {image3 && image3.size <= MAX_IMAGE_BYTES && image3PreviewUrl && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img src={image3PreviewUrl} alt="" className="h-20 w-20 rounded-lg object-contain bg-slate-100" />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600" title={image3.name}>{image3.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImage3(null); setError(null); }}
                      className="absolute -right-1 -top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      aria-label="Remove image"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {isEdit && !image3 && (
                  <div className="relative mt-2 inline-block">
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
                      <img
                        src={existingImageUrls?.[2] ? `${getBackendUrl()}${existingImageUrls[2]}` : PRODUCT_PLACEHOLDER_IMAGE}
                        alt=""
                        className="h-20 w-20 rounded-lg object-contain bg-slate-100"
                      />
                      <p className="mt-1 truncate text-xs font-medium text-slate-600">Current image 3</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !products.length}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition cursor-pointer hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? (isEdit ? "Updating…" : "Creating…") : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

        {error && !modalOpen && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <CardGridSkeleton />
        ) : (
          <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedList.map((m) => (
              <article
                key={m.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-lg hover:ring-slate-300/60"
              >
                {/* Image strip */}
                <div className="flex aspect-[3/1] min-h-[110px] border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/80">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-1 items-center justify-center overflow-hidden border-r border-slate-200/60 last:border-r-0 bg-white/50"
                    >
                      <img
                        src={m.imageUrls?.[i] ? `${getBackendUrl()}${m.imageUrls[i]}` : PRODUCT_PLACEHOLDER_IMAGE}
                        alt=""
                        className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                      />
                    </div>
                  ))}
                </div>
                {/* Name + price strip with accent background */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-100 to-indigo-50/90 px-4 py-2.5">
                  <div className="relative flex items-center justify-center">
                    <h2 className="text-center text-lg font-semibold leading-snug text-slate-900 line-clamp-2 pr-20">{m.name}</h2>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 shrink-0 inline-flex items-center rounded-lg bg-indigo-100 px-2.5 py-1 text-sm font-semibold text-indigo-800">
                      ${Number(m.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="space-y-1.5 rounded-xl bg-slate-50/80 py-2.5 pl-0 pr-3 min-h-[120px]">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Brand</span>
                      <span className="truncate text-right text-slate-800" title={m.product?.brand?.name ?? undefined}>{m.product?.brand?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Category</span>
                      <span className="truncate text-right text-slate-800" title={m.product?.brand?.category?.name ?? undefined}>{m.product?.brand?.category?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Product</span>
                      <span className="truncate text-right text-slate-800" title={m.product?.name ?? undefined}>{m.product?.name ?? "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Description</span>
                      <p className="line-clamp-2 text-slate-800" title={m.description ?? undefined}>
                        {m.description != null && m.description !== "" ? m.description : "—"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Flavors</span>
                      <p className="line-clamp-1 text-slate-800" title={Array.isArray(m.flavors) && m.flavors.length > 0 ? m.flavors.join(", ") : undefined}>
                        {Array.isArray(m.flavors) && m.flavors.length > 0 ? m.flavors.join(", ") : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.is_clearance && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Clearance</span>}
                      {m.is_deal && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">Deal</span>}
                      {m.is_best_seller && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Best Seller</span>}
                      {m.is_new && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">New</span>}
                      {m.is_featured && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">Featured</span>}
                    </div>
                    {m.is_deal && (m.deal_text ?? "On Sale") && (
                      <div className="text-sm text-rose-700 font-medium truncate" title={m.deal_text ?? "On Sale"}>{m.deal_text || "On Sale"}</div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-slate-400" title={`Created ${formatDateTime(m.createdAt)} · Updated ${formatDateTime(m.updatedAt)}`}>
                    <span>Added {formatDateCard(m.createdAt)}</span>
                    <span className="text-slate-300">·</span>
                    <span>Updated {formatDateCard(m.updatedAt)}</span>
                  </div>
                  {(canUpdate || canDelete) && (
                    <div className="mt-auto flex flex-shrink-0 flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => openEditModal(m)}
                          className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="cursor-pointer rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-sm font-medium text-red-600 opacity-90 shadow-sm transition hover:opacity-100 hover:border-red-300 hover:bg-red-100 hover:shadow"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {list.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center text-slate-500">
                No models match your filters.
              </p>
            )}
          </div>
          {list.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={list.length}
              onPageChange={setPage}
            />
          )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
