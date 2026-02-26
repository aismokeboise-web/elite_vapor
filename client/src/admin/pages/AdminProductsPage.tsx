import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAdminAuth } from "../auth";
import {
  fetchProducts,
  fetchBrands,
  fetchModels,
  createProduct,
  updateProduct,
  deleteProduct,
  getFriendlyErrorMessage,
  type ApiProductWithModels,
  type ApiBrand,
  type ApiModel,
} from "../../api/client";
import { AdminModal } from "../components/AdminModal";
import { AdminErrorAlert } from "../components/AdminErrorAlert";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminSkeleton } from "../components/AdminSkeleton";

type SortKey = "name" | "size" | "brand" | "models" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export function AdminProductsPage() {
  const auth = getAdminAuth();
  const [products, setProducts] = useState<ApiProductWithModels[] | null>(null);
  const [brands, setBrands] = useState<ApiBrand[] | null>(null);
  const [models, setModels] = useState<ApiModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProductWithModels | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<ApiProductWithModels | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 10;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchProducts(), fetchBrands(), fetchModels()])
      .then(([p, b, m]) => {
        setProducts(p);
        setBrands(b);
        setModels(m);
      })
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(() => {
    const byId = new Map<string, string>();
    (products ?? []).forEach((p) => {
      const cat = p.brand?.category;
      if (cat && !byId.has(cat.id)) byId.set(cat.id, cat.name ?? cat.id);
    });
    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let list = products ?? [];
    if (categoryFilter) {
      list = list.filter((p) => p.brand?.category?.id === categoryFilter);
    }
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.size ?? "").toLowerCase().includes(q) ||
          (p.brand?.name ?? "").toLowerCase().includes(q) ||
          (p.nicotineStrength ?? "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortKey === "name") {
        aVal = a.name ?? "";
        bVal = b.name ?? "";
      } else if (sortKey === "size") {
        aVal = a.size ?? "";
        bVal = b.size ?? "";
      } else if (sortKey === "brand") {
        aVal = a.brand?.name ?? "";
        bVal = b.brand?.name ?? "";
      } else if (sortKey === "models") {
        aVal = a.models?.length ?? 0;
        bVal = b.models?.length ?? 0;
      } else if (sortKey === "createdAt") {
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortKey === "updatedAt") {
        aVal = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        bVal = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      }
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, categoryFilter, filter, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedProducts = useMemo(
    () => filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredAndSorted, currentPage]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (loading && !products?.length) {
    return <AdminSkeleton title="Products" cards={6} />;
  }

  if (error && !products?.length) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Products</h1>
        <div className="mt-6">
          <AdminErrorAlert message={error} title="Couldn't load products" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Products</h1>
          <p className="mt-2 text-base text-slate-600">
            {filteredAndSorted.length} {(filteredAndSorted.length === 1) ? "product" : "products"}
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
          Create product
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name, size, or brand…"
          className="min-w-[28rem] w-full max-w-xl rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="admin-products-category-filter" className="text-sm font-medium text-slate-700">
            Category:
          </label>
          <select
            id="admin-products-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All categories</option>
            {categoryOptions.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Sort by:</span>
        {(["name", "size", "brand", "models", "createdAt", "updatedAt"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleSort(key)}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              sortKey === key
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            {key === "createdAt" ? "Created" : key === "updatedAt" ? "Updated" : key.charAt(0).toUpperCase() + key.slice(1)}
            {sortKey === key ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
          </button>
        ))}
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:text-sm">
          <span className="text-[0.7rem] font-semibold tracking-tight text-slate-600 sm:text-xs">
            Showing{" "}
            {paginatedProducts.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} products
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

      <ul className="mt-6 space-y-4">
        {paginatedProducts.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden hover:shadow-lg"
          >
            <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="flex-1 p-5 bg-white border-b sm:border-b-0 sm:border-r border-slate-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[minmax(10rem,auto)_1fr] sm:text-base max-w-2xl sm:items-baseline">
                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Product Name</dt>
                  <dd className="min-w-0 text-base font-semibold text-slate-900 sm:text-lg">{p.name ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Brand</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{p.brand?.name ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Category</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{p.brand?.category?.name ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Size</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{p.size ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Nicotine strength</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{p.nicotineStrength ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Models</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">
                    {p.models?.length ? p.models.map((m) => m.name).join(", ") : "None"}
                  </dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Created at</dt>
                  <dd className="min-w-0 text-slate-900 text-xs sm:text-sm">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : "None"}
                  </dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Updated at</dt>
                  <dd className="min-w-0 text-slate-900 text-xs sm:text-sm">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "None"}
                  </dd>
                </dl>
              </div>
              <div className="flex shrink-0 gap-2 p-4 bg-slate-100 items-center justify-end sm:flex-col sm:justify-center sm:w-40 sm:min-w-0 md:w-44">
                <button
                  type="button"
                  onClick={() => {
                    setEditProduct(p);
                    setSubmitError(null);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 md:text-base"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteProductTarget(p)}
                  className="w-full rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50 md:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:text-sm">
          <span className="text-[0.7rem] font-semibold tracking-tight text-slate-600 sm:text-xs">
            Showing{" "}
            {paginatedProducts.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} products
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

      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        brands={brands ?? []}
        models={models ?? []}
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
      <EditProductModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
        brands={brands ?? []}
        models={models ?? []}
        onSuccess={() => {
          setEditProduct(null);
          load();
        }}
        token={auth?.token ?? ""}
        setSubmitError={setSubmitError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        submitError={submitError}
      />
      <AdminDeleteConfirmModal
        open={!!deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        title="Delete product"
        itemLabel={deleteProductTarget?.name ?? ""}
        confirming={deleting}
        onConfirm={async () => {
          if (!auth?.token || !deleteProductTarget) return;
          setDeleting(true);
          try {
            await deleteProduct(auth.token, deleteProductTarget.id);
            setDeleteProductTarget(null);
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

function ModelSelectDropdown({
  models,
  value,
  onChange,
  id,
  disabled,
}: {
  models: ApiModel[];
  value: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [flagFilter, setFlagFilter] = useState({ new: false, deal: false, bestSeller: false, clearance: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = models;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          (m.name ?? "").toLowerCase().includes(q) ||
          (m.id ?? "").toLowerCase().includes(q)
      );
    }
    const { new: flNew, deal: flDeal, bestSeller: flBest, clearance: flClear } = flagFilter;
    if (flNew || flDeal || flBest || flClear) {
      list = list.filter((m) => {
        if (flNew && m.is_new) return true;
        if (flDeal && m.is_deal) return true;
        if (flBest && m.is_best_seller) return true;
        if (flClear && m.is_clearance) return true;
        return false;
      });
    }
    return list;
  }, [models, search, flagFilter]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setFlagFilter({ new: false, deal: false, bestSeller: false, clearance: false });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const toggle = (modelId: string) => {
    if (selectedSet.has(modelId)) {
      onChange(value.filter((id) => id !== modelId));
    } else {
      onChange([...value, modelId]);
    }
  };

  const selectedNames = useMemo(
    () => value.map((id) => models.find((m) => m.id === id)?.name ?? id),
    [value, models]
  );
  const triggerLabel =
    value.length === 0
      ? "Select models…"
      : value.length <= 2
        ? selectedNames.join(", ")
        : `${value.length} models selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
      >
        <span className="truncate">{triggerLabel}</span>
        <svg className="ml-2 h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full min-w-[20rem] md:min-w-[24rem] rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
          <div className="border-b border-slate-100 px-2 pb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models by name…"
              className="w-full min-w-0 rounded border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
              <span className="font-medium">Filter by flag:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagFilter.new}
                  onChange={(e) => setFlagFilter((f) => ({ ...f, new: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                />
                <span>New</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagFilter.deal}
                  onChange={(e) => setFlagFilter((f) => ({ ...f, deal: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                />
                <span>Deal</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagFilter.bestSeller}
                  onChange={(e) => setFlagFilter((f) => ({ ...f, bestSeller: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                />
                <span>Best seller</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagFilter.clearance}
                  onChange={(e) => setFlagFilter((f) => ({ ...f, clearance: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                />
                <span>Clearance</span>
              </label>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">No models match.</p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selectedSet.has(m.id) ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}
                  >
                    {selectedSet.has(m.id) && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BrandSelectDropdown({
  brands,
  value,
  onChange,
  id,
  disabled,
  placeholder = "Select brand…",
}: {
  brands: ApiBrand[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) =>
        (b.name ?? "").toLowerCase().includes(q) ||
        (b.id ?? "").toLowerCase().includes(q)
    );
  }, [brands, search]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selectedBrand = useMemo(() => brands.find((b) => b.id === value), [brands, value]);
  const triggerLabel = selectedBrand ? selectedBrand.name : value ? value : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
      >
        <span className="truncate">{triggerLabel}</span>
        <svg className="ml-2 h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full min-w-[16rem] rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
          <div className="border-b border-slate-100 px-2 pb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands…"
              className="w-full min-w-0 rounded border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${!value ? "bg-indigo-50 text-indigo-800" : "text-slate-700"}`}
            >
              — None —
            </button>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">No brands match.</p>
            ) : (
              filtered.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onChange(b.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${value === b.id ? "bg-indigo-50 text-indigo-800" : "text-slate-700"}`}
                >
                  {b.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateProductModal({
  open,
  onClose,
  brands,
  models,
  onSuccess,
  token,
  setSubmitError,
  submitting,
  setSubmitting,
  submitError,
}: {
  open: boolean;
  onClose: () => void;
  brands: ApiBrand[];
  models: ApiModel[];
  onSuccess: () => void;
  token: string;
  setSubmitError: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  submitError: string | null;
}) {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [nicotineStrength, setNicotineStrength] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName("");
      setSize("");
      setNicotineStrength("");
      setBrandId("");
      setSelectedModelIds([]);
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
      await createProduct(token, {
        name: name.trim(),
        size: size.trim() || null,
        nicotineStrength: nicotineStrength.trim() || null,
        brandId: brandId || null,
        modelIds: selectedModelIds,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Create product" open={open} onClose={onClose} size="wide">
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
        <div>
          <label className="block text-sm font-medium text-slate-800">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => { setSize(e.target.value); setSubmitError(null); }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Nicotine strength</label>
          <input
            type="text"
            value={nicotineStrength}
            onChange={(e) => { setNicotineStrength(e.target.value); setSubmitError(null); }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Brand</label>
          <BrandSelectDropdown
            brands={brands}
            value={brandId}
            onChange={(id) => { setBrandId(id); setSubmitError(null); }}
            placeholder="Select brand…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Models</label>
          <ModelSelectDropdown
            models={models}
            value={selectedModelIds}
            onChange={(ids) => { setSelectedModelIds(ids); setSubmitError(null); }}
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

function EditProductModal({
  product,
  onClose,
  brands,
  models,
  onSuccess,
  token,
  setSubmitError,
  submitting,
  setSubmitting,
  submitError,
}: {
  product: ApiProductWithModels | null;
  onClose: () => void;
  brands: ApiBrand[];
  models: ApiModel[];
  onSuccess: () => void;
  token: string;
  setSubmitError: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  submitError: string | null;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [nicotineStrength, setNicotineStrength] = useState(product?.nicotineStrength ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(product?.modelIds ?? []);

  useEffect(() => {
    if (product) {
      setName(product.name ?? "");
      setSize(product.size ?? "");
      setNicotineStrength(product.nicotineStrength ?? "");
      setBrandId(product.brandId ?? "");
      setSelectedModelIds(product.modelIds ?? []);
      setSubmitError(null);
    }
  }, [product, setSubmitError]);

  if (!product) return null;

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
      await updateProduct(token, product.id, {
        name: name.trim(),
        size: size.trim() || null,
        nicotineStrength: nicotineStrength.trim() || null,
        brandId: brandId || null,
        modelIds: selectedModelIds,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Edit product" open={!!product} onClose={onClose} size="wide">
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nicotine strength</label>
          <input
            type="text"
            value={nicotineStrength}
            onChange={(e) => setNicotineStrength(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand</label>
          <BrandSelectDropdown
            brands={brands}
            value={brandId}
            onChange={(id) => setBrandId(id)}
            placeholder="Select brand…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Models</label>
          <ModelSelectDropdown
            models={models}
            value={selectedModelIds}
            onChange={setSelectedModelIds}
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
