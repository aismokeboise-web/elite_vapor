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

type Category = { id: string; name: string; createdAt?: string; updatedAt?: string };
type Brand = { id: string; name: string; categoryId: string; category?: Category; createdAt?: string; updatedAt?: string };

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

export default function BrandsPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const perPage = usePerPage();

  const canCreate = can("brand", "create");
  const canUpdate = can("brand", "update");
  const canDelete = can("brand", "delete");
  const isEdit = editingId != null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes] = await Promise.all([
        fetchWithAuth("/api/categories"),
        fetchWithAuth(
          (() => {
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (filterCategoryId) params.set("categoryId", filterCategoryId);
            return params.toString() ? `/api/brands?${params}` : "/api/brands";
          })()
        ),
      ]);
      if (!catRes.ok) throw new Error("Failed to load categories");
      if (!brandRes.ok) throw new Error("Failed to load brands");
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      setCategories(catData);
      setList(brandData);
      setPage(1);
      if (catData.length && !categoryId) setCategoryId(catData[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filterCategoryId]);

  const totalPages = Math.ceil(list.length / perPage) || 1;
  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  const openModal = () => {
    setEditingId(null);
    setName("");
    setCategoryId(categories[0]?.id ?? "");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingId(b.id);
    setName(b.name);
    setCategoryId(b.categoryId ?? categories[0]?.id ?? "");
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await fetchWithAuth(`/api/brands/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), categoryId }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || "Update failed");
        }
      } else {
        const res = await fetchWithAuth("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), categoryId }),
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
    if (!confirm("Delete this brand?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/brands/${id}`, { method: "DELETE" });
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
          <h1 className="col-span-2 row-start-2 sm:row-start-1 sm:col-span-1 sm:col-start-2 text-center text-xl font-bold text-slate-900 sm:text-2xl">All Brands</h1>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="brand-search">Search by name</label>
          <input
            id="brand-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full min-w-[200px] max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="brand-filter-cat" className="text-sm font-medium text-slate-700">Category</label>
            <select
              id="brand-filter-cat"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit brand" : "Create brand"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Brand name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                disabled={submitting || !categories.length}
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
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedList.map((b) => (
              <article
                key={b.id}
                className="group flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-lg hover:ring-slate-300/60"
              >
                {/* Header with accent */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-100 to-indigo-50/90 px-4 py-2.5">
                  <h2 className="text-center font-semibold leading-snug text-slate-900 line-clamp-2">{b.name}</h2>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-slate-50/80 px-3 py-2 text-sm sm:gap-x-5 md:gap-x-6">
                    <span className="font-medium text-slate-500">Category</span>
                    <span className="min-w-0 truncate text-slate-800">{b.category?.name ?? "—"}</span>
                    <span className="text-xs text-slate-400">Added {formatDateCard(b.createdAt)} ·</span>
                    <span className="min-w-0 truncate text-xs text-slate-400" title={`Created ${formatDateTime(b.createdAt)} · Updated ${formatDateTime(b.updatedAt)}`}>
                      Updated {formatDateCard(b.updatedAt)}
                    </span>
                  </div>
                  {(canUpdate || canDelete) && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => openEditModal(b)}
                          className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
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
                No brands yet.
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
