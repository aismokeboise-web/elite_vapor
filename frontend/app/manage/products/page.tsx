"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton } from "@/components/Skeleton";
import { usePerPage } from "../../../lib/usePerPage";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; categoryId?: string; category?: { id: string; name: string }; createdAt?: string; updatedAt?: string };
type Product = {
  id: string;
  name: string;
  slug?: string | null;
  size: string | null;
  nicotineStrength: string | null;
  brandId: string;
  brand?: Brand;
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

export default function ProductsPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brandId, setBrandId] = useState("");
  const [size, setSize] = useState("");
  const [nicotineStrength, setNicotineStrength] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBrandId, setFilterBrandId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterNicotineStrength, setFilterNicotineStrength] = useState("");
  const [page, setPage] = useState(1);
  const perPage = usePerPage();

  const canCreate = can("product", "create");
  const canUpdate = can("product", "update");
  const canDelete = can("product", "delete");
  const isEdit = editingId != null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes, productRes] = await Promise.all([
        fetchWithAuth("/api/categories"),
        fetchWithAuth("/api/brands"),
        fetchWithAuth(
          (() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (filterBrandId) params.set("brandId", filterBrandId);
            if (filterCategoryId) params.set("categoryId", filterCategoryId);
            if (filterSize.trim()) params.set("size", filterSize.trim());
            if (filterNicotineStrength.trim()) params.set("nicotineStrength", filterNicotineStrength.trim());
            return params.toString() ? `/api/products?${params}` : "/api/products";
          })()
        ),
      ]);
      if (!catRes.ok) throw new Error("Failed to load categories");
      if (!brandRes.ok) throw new Error("Failed to load brands");
      if (!productRes.ok) throw new Error("Failed to load products");
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      const productData = await productRes.json();
      setCategories(catData);
      setBrands(brandData);
      setList(productData);
      setPage(1);
      if (brandData.length && !brandId) setBrandId(brandData[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filterBrandId, filterCategoryId, filterSize, filterNicotineStrength]);

  const totalPages = Math.ceil(list.length / perPage) || 1;
  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  const openModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setBrandId(brands[0]?.id ?? "");
    setSize("");
    setNicotineStrength("");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug || "");
    setBrandId(p.brandId ?? brands[0]?.id ?? "");
    setSize(p.size ?? "");
    setNicotineStrength(p.nicotineStrength ?? "");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brandId) return;
    if (!slug.trim()) { setError("URL slug is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await fetchWithAuth(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            brandId,
            size: size.trim() || undefined,
            nicotineStrength: nicotineStrength.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || "Update failed");
        }
      } else {
        const res = await fetchWithAuth("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            brandId,
            size: size.trim() || undefined,
            nicotineStrength: nicotineStrength.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || "Create failed");
        }
      }
      setModalOpen(false);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : (isEdit ? "Update failed" : "Create failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="group flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600 hover:underline"
            >
              <svg className="h-4 w-4 shrink-0 transition-colors group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          <div className="flex justify-end">
            {canCreate && (
              <button
                type="button"
                onClick={openModal}
                className="rounded-xl bg-indigo-200 px-5 py-2.5 text-sm font-medium text-indigo-800 shadow-sm transition cursor-pointer hover:bg-indigo-600 hover:text-white sm:w-auto"
              >
                Create
              </button>
            )}
          </div>
          <h1 className="col-span-2 row-start-2 sm:row-start-1 sm:col-span-1 sm:col-start-2 text-center text-xl font-bold text-slate-900 sm:text-2xl">All Products</h1>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="product-search">Search by name</label>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full min-w-[200px] max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="product-filter-cat" className="text-sm font-medium text-slate-700">Category</label>
            <select
              id="product-filter-cat"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="product-filter-brand" className="text-sm font-medium text-slate-700">Brand</label>
            <select
              id="product-filter-brand"
              value={filterBrandId}
              onChange={(e) => setFilterBrandId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="product-filter-size" className="text-sm font-medium text-slate-700">Size</label>
            <input
              id="product-filter-size"
              type="text"
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              placeholder="e.g. 30ml"
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="product-filter-nicotine" className="text-sm font-medium text-slate-700">Nicotine</label>
            <input
              id="product-filter-nicotine"
              type="text"
              value={filterNicotineStrength}
              onChange={(e) => setFilterNicotineStrength(e.target.value)}
              placeholder="e.g. 3mg"
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit product" : "Create product"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Product name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. horizon-tech-vape"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Used in URL: /product/{slug || "your-slug"}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Size (optional)</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. 30ml"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nicotine strength (optional)</label>
              <input
                type="text"
                value={nicotineStrength}
                onChange={(e) => setNicotineStrength(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. 3mg"
              />
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
                disabled={submitting || !brands.length}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedList.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-lg hover:ring-slate-300/60"
              >
                {/* Header with accent */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-100 to-indigo-50/90 px-4 py-2.5">
                  <h2 className="text-center font-semibold leading-snug text-slate-900 line-clamp-2">{p.name}</h2>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="space-y-1.5 rounded-xl bg-slate-50/80 px-3 py-2">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Brand</span>
                      <span className="truncate text-right text-slate-800">{p.brand?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Category</span>
                      <span className="truncate text-right text-slate-800">{p.brand?.category?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Size</span>
                      <span className="truncate text-right text-slate-800">{p.size?.trim() || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Nicotine strength</span>
                      <span className="truncate text-right text-slate-800">{p.nicotineStrength?.trim() || "—"}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-2 text-center text-xs text-slate-400" title={`Created ${formatDateTime(p.createdAt)} · Updated ${formatDateTime(p.updatedAt)}`}>
                    <span>Added {formatDateCard(p.createdAt)}</span>
                    <span className="text-slate-300">·</span>
                    <span>Updated {formatDateCard(p.updatedAt)}</span>
                  </div>
                  {(canUpdate || canDelete) && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
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
                No products yet.
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
