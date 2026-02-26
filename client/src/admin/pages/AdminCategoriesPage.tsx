import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminAuth } from "../auth";
import { fetchCategories, createCategory, updateCategory, deleteCategory, getFriendlyErrorMessage, type ApiCategory } from "../../api/client";
import { AdminModal } from "../components/AdminModal";
import { AdminErrorAlert } from "../components/AdminErrorAlert";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminSkeleton } from "../components/AdminSkeleton";
import { useScrollToTopOnPageChange } from "../useScrollToTopOnPageChange";

type SortKey = "name" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 20;

export function AdminCategoriesPage() {
  const auth = getAdminAuth();
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ApiCategory | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ApiCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useScrollToTopOnPageChange(currentPage);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCategories()
      .then(setCategories)
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredAndSorted = useMemo(() => {
    let list = categories ?? [];
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => (c.name ?? "").toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });
      } else if (sortKey === "createdAt") {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        cmp = at - bt;
      } else {
        const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        cmp = at - bt;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [categories, filter, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const paginatedCategories = useMemo(
    () => filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredAndSorted, currentPage]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (loading && !categories?.length) {
    return <AdminSkeleton title="Categories" tableRows={8} />;
  }

  if (error && !categories?.length) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Categories</h1>
        <div className="mt-6">
          <AdminErrorAlert message={error} title="Couldn't load categories" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Categories</h1>
          <p className="mt-2 text-base text-slate-600">
            {filteredAndSorted.length} {(filteredAndSorted.length === 1) ? "category" : "categories"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setSubmitError(null);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Create category
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name…"
          className="min-w-[20rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:text-sm">
          <span className="text-[0.7rem] font-semibold tracking-tight text-slate-600 sm:text-xs">
            Showing{" "}
            {(currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} categories
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    page === currentPage
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-base">
          <thead className="bg-slate-100">
            <tr className="text-slate-600">
              <th className="px-5 py-4 text-left font-semibold">
                <button type="button" onClick={() => toggleSort("name")} className="hover:text-slate-800">
                  Name {sortKey === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-left font-semibold">
                <button type="button" onClick={() => toggleSort("createdAt")} className="hover:text-slate-800">
                  Created at {sortKey === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-left font-semibold">
                <button type="button" onClick={() => toggleSort("updatedAt")} className="hover:text-slate-800">
                  Updated at {sortKey === "updatedAt" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 bg-white">
                <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-5 py-3 text-slate-600 text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "None"}</td>
                <td className="px-5 py-3 text-slate-600 text-sm">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "None"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategory(c);
                        setSubmitError(null);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryTarget(c)}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:text-sm">
          <span className="text-[0.7rem] font-semibold tracking-tight text-slate-600 sm:text-xs">
            Showing{" "}
            {(currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} categories
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    page === currentPage
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CreateCategoryModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          load();
        }}
        token={auth?.token ?? ""}
        setSubmitError={setSubmitError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        submitError={submitError}
      />
      <EditCategoryModal
        category={editCategory}
        onClose={() => setEditCategory(null)}
        onSuccess={() => {
          setEditCategory(null);
          load();
        }}
        token={auth?.token ?? ""}
        setSubmitError={setSubmitError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        submitError={submitError}
      />
      <AdminDeleteConfirmModal
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        title="Delete category"
        itemLabel={deleteCategoryTarget?.name ?? ""}
        confirming={deleting}
        onConfirm={async () => {
          if (!auth?.token || !deleteCategoryTarget) return;
          setDeleting(true);
          try {
            await deleteCategory(auth.token, deleteCategoryTarget.id);
            setDeleteCategoryTarget(null);
            load();
          } catch (e) {
            setError(getFriendlyErrorMessage(e));
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
  token,
  setSubmitError,
  submitting,
  setSubmitting,
  submitError,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  setSubmitError: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  submitError: string | null;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setSubmitError(null);
    }
  }, [open, setSubmitError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Name is required.");
      return;
    }
    if (!token) {
      setSubmitError("Not authenticated.");
      return;
    }
    setSubmitting(true);
    try {
      await createCategory(token, { name: name.trim() });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Create category" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSubmitError(null); }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
        {submitError && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
        )}
      </form>
    </AdminModal>
  );
}

function EditCategoryModal({
  category,
  onClose,
  onSuccess,
  token,
  setSubmitError,
  submitting,
  setSubmitting,
  submitError,
}: {
  category: ApiCategory | null;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  setSubmitError: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  submitError: string | null;
}) {
  const [name, setName] = useState(category?.name ?? "");

  useEffect(() => {
    if (category) {
      setName(category.name ?? "");
      setSubmitError(null);
    }
  }, [category, setSubmitError]);

  if (!category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Name is required.");
      return;
    }
    if (!token) {
      setSubmitError("Not authenticated.");
      return;
    }
    setSubmitting(true);
    try {
      await updateCategory(token, category.id, { name: name.trim() });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Edit category" open={!!category} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
        {submitError && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
        )}
      </form>
    </AdminModal>
  );
}
