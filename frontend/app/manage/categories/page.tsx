"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch, getBackendUrl } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton } from "@/components/Skeleton";
import { usePerPage } from "../../../lib/usePerPage";

type Category = { id: string; name: string; slug?: string | null; iconPath: string | null; createdAt?: string; updatedAt?: string };

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

export default function CategoriesPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [existingIconPath, setExistingIconPath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = usePerPage();

  const canCreate = can("category", "create");
  const canUpdate = can("category", "update");
  const canDelete = can("category", "delete");
  const isEdit = editingId != null;

  useEffect(() => {
    if (!iconFile) {
      setIconPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(iconFile);
    setIconPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [iconFile]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const url = params.toString() ? `/api/categories?${params}` : "/api/categories";
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setList(data);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const totalPages = Math.ceil(list.length / perPage) || 1;
  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setIconFile(null);
    setExistingIconPath(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug || "");
    setIconFile(null);
    setExistingIconPath(c.iconPath);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!slug.trim()) { setError("URL slug is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const id = editingId!;
        if (iconFile) {
          const formData = new FormData();
          formData.append("name", name.trim());
          formData.append("slug", slug.trim());
          formData.append("icon", iconFile);
          const res = await fetchWithAuth(`/api/categories/${id}`, { method: "PUT", body: formData });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error || "Update failed"); }
        } else {
          const res = await fetchWithAuth(`/api/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
          });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error || "Update failed"); }
        }
      } else {
        if (iconFile) {
          const formData = new FormData();
          formData.append("name", name.trim());
          formData.append("slug", slug.trim());
          formData.append("icon", iconFile);
          const res = await fetchWithAuth("/api/categories", { method: "POST", body: formData });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error || "Create failed"); }
        } else {
          const res = await fetchWithAuth("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
          });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { error?: string }).error || "Create failed"); }
        }
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : isEdit ? "Update failed" : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const modalTitle = isEdit ? "Edit category" : "Create category";
  const showIconPreview = iconPreviewUrl || (isEdit && !iconFile && existingIconPath);
  const currentIconUrl = useMemo(() => {
    if (iconPreviewUrl) return iconPreviewUrl;
    if (existingIconPath) return `${getBackendUrl()}${existingIconPath}`;
    return null;
  }, [iconPreviewUrl, existingIconPath]);

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
                onClick={openCreateModal}
                className="rounded-xl bg-indigo-200 px-5 py-2.5 text-sm font-medium text-indigo-800 shadow-sm transition cursor-pointer hover:bg-indigo-600 hover:text-white sm:w-auto"
              >
                Create
              </button>
            )}
          </div>
          <h1 className="col-span-2 row-start-2 sm:row-start-1 sm:col-span-1 sm:col-start-2 text-center text-xl font-bold text-slate-900 sm:text-2xl">All Categories</h1>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="cat-search">Search by name</label>
          <input
            id="cat-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full min-w-[200px] max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
          />
        </div>

        {!loading && list.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={list.length}
            onPageChange={setPage}
          />
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
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
                placeholder="Category name"
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
                placeholder="e.g. disposable-vapes"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Used in URL: /category/{slug || "your-slug"}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Icon (optional)</label>
              <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-sm file:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">{iconFile ? `Selected: ${iconFile.name}` : isEdit && existingIconPath ? `Current: ${existingIconPath.replace(/^.*\//, "")}` : `SVG only, max 64 KB. ${isEdit ? "Leave empty to keep current icon." : ""}`}</p>
            </div>
            {showIconPreview && currentIconUrl && (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-indigo-600">Preview</p>
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                  <img
                    src={currentIconUrl}
                    alt="Icon preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
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
                disabled={submitting}
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
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list
              .slice((page - 1) * perPage, page * perPage)
              .map((c) => (
              <div
                key={c.id}
                className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-0 shadow-sm"
              >
                <div className="rounded-t-xl border-b border-slate-100 bg-gradient-to-r from-indigo-100 to-indigo-50/90 px-3 py-2 sm:px-4">
                  <p className="text-center font-medium text-slate-900 truncate">{c.name}</p>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-start gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80">
                      {c.iconPath ? (
                        <img
                          src={`${getBackendUrl()}${c.iconPath}`}
                          alt=""
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col items-stretch text-left text-xs text-slate-400" title={`Created ${formatDateTime(c.createdAt)} · Updated ${formatDateTime(c.updatedAt)}`}>
                      <span>Added {formatDateCard(c.createdAt)}</span>
                      <span>Updated {formatDateCard(c.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
                    {canUpdate && (
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="cursor-pointer rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-sm font-medium text-red-600 opacity-90 shadow-sm transition hover:opacity-100 hover:border-red-300 hover:bg-red-100 hover:shadow"
                    >
                      Delete
                    </button>
                  )}
                  </div>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <p className="col-span-full py-12 text-center text-slate-500">No categories yet.</p>
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
