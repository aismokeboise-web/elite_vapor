import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAdminAuth } from "../auth";
import { fetchModels, createModel, updateModel, deleteModel, uploadModelImage, getFriendlyErrorMessage, type ApiModel } from "../../api/client";
import { AdminModal } from "../components/AdminModal";
import { AdminErrorAlert } from "../components/AdminErrorAlert";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminSkeleton } from "../components/AdminSkeleton";
import { useScrollToTopOnPageChange } from "../useScrollToTopOnPageChange";

type SortKey = "name" | "price" | "flags" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

function flagsLabel(m: ApiModel): string {
  return [m.is_best_seller && "Best seller", m.is_new && "New", m.is_deal && "Deal", m.is_clearance && "Clearance"]
    .filter(Boolean)
    .join(", ") || "None";
}

/** Get display filename from an image URL (e.g. /uploads/foo.jpg -> foo.jpg) */
function filenameFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1]?.trim() || url;
}

/** Safe numeric timestamp for sorting (handles missing, null, invalid, or number).
 * Tries both camelCase and snake_case in case the API or proxy normalizes keys. */
function getDateSortKey(m: ApiModel, key: "createdAt" | "updatedAt"): number {
  const rec = m as unknown as Record<string, unknown>;
  const snake = key === "createdAt" ? "created_at" : "updated_at";
  const v = rec[key] ?? rec[snake];
  if (v == null) return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

export function AdminModelsPage() {
  const auth = getAdminAuth();
  const [models, setModels] = useState<ApiModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [filterFlags, setFilterFlags] = useState({ new: false, deal: false, bestSeller: false, clearance: false });
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editModel, setEditModel] = useState<ApiModel | null>(null);
  const [deleteModelTarget, setDeleteModelTarget] = useState<ApiModel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 10;

  useScrollToTopOnPageChange(currentPage);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchModels()
      .then(setModels)
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredAndSorted = useMemo(() => {
    let list = models ?? [];
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          (m.name ?? "").toLowerCase().includes(q) ||
          (m.description ?? "").toLowerCase().includes(q) ||
          (String(m.price) ?? "").toLowerCase().includes(q) ||
          flagsLabel(m).toLowerCase().includes(q)
      );
    }
    const { new: flNew, deal: flDeal, bestSeller: flBest, clearance: flClear } = filterFlags;
    if (flNew || flDeal || flBest || flClear) {
      list = list.filter((m) => {
        if (flNew && m.is_new) return true;
        if (flDeal && m.is_deal) return true;
        if (flBest && m.is_best_seller) return true;
        if (flClear && m.is_clearance) return true;
        return false;
      });
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });
      } else if (sortKey === "price") {
        const ap = typeof a.price === "number" ? a.price : a.price != null ? Number(a.price) : -Infinity;
        const bp = typeof b.price === "number" ? b.price : b.price != null ? Number(b.price) : -Infinity;
        cmp = ap - bp;
      } else if (sortKey === "createdAt") {
        cmp = getDateSortKey(a, "createdAt") - getDateSortKey(b, "createdAt");
      } else if (sortKey === "updatedAt") {
        cmp = getDateSortKey(a, "updatedAt") - getDateSortKey(b, "updatedAt");
      } else {
        cmp = flagsLabel(a).localeCompare(flagsLabel(b), undefined, { sensitivity: "base" });
      }
      if (cmp !== 0) return sortOrder === "asc" ? cmp : -cmp;
      return (a.id ?? "").localeCompare(b.id ?? "", undefined, { sensitivity: "base" });
    });
    return list;
  }, [models, filter, filterFlags, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedModels = useMemo(
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

  if (loading && !models?.length) {
    return <AdminSkeleton title="Models" cards={6} />;
  }

  if (error && !models?.length) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Models</h1>
        <div className="mt-6">
          <AdminErrorAlert message={error} title="Couldn't load models" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Models</h1>
          <p className="mt-2 text-base text-slate-600">
            {filteredAndSorted.length} {(filteredAndSorted.length === 1) ? "model" : "models"}
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
          Create model
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search models…"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:min-w-[18rem] md:min-w-[24rem] lg:min-w-[32rem]"
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span className="font-medium text-slate-600">Filter by flag:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFlags.new}
              onChange={(e) => setFilterFlags((f) => ({ ...f, new: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>New</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFlags.deal}
              onChange={(e) => setFilterFlags((f) => ({ ...f, deal: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Deal</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFlags.bestSeller}
              onChange={(e) => setFilterFlags((f) => ({ ...f, bestSeller: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Best seller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFlags.clearance}
              onChange={(e) => setFilterFlags((f) => ({ ...f, clearance: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Clearance</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Sort by:</span>
        {(["name", "price", "flags", "createdAt", "updatedAt"] as const).map((key) => (
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
            {paginatedModels.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} models
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
            <div className="flex flex-wrap items-center justify-center gap-1">
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
        {paginatedModels.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden hover:shadow-lg"
          >
            <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="flex-1 p-5 bg-white border-b sm:border-b-0 sm:border-r border-slate-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[minmax(10rem,auto)_1fr] sm:text-base max-w-2xl sm:items-baseline">
                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Model Name</dt>
                  <dd className="min-w-0 text-base font-semibold text-slate-900 sm:text-lg">{m.name ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Price</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">
                    {m.price != null && m.price !== "" ? `$${Number(m.price).toFixed(2)}` : "$0.00"}
                  </dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Description</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{m.description ?? "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Flavors</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{m.flavors?.length ? m.flavors.join(", ") : "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Flags</dt>
                  <dd className="min-w-0">
                    <span className="flex flex-wrap gap-1.5 text-slate-900 text-sm sm:text-base">
                      {m.is_best_seller && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Best seller</span>}
                      {m.is_new && <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">New</span>}
                      {m.is_deal && <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">Deal</span>}
                      {m.is_clearance && <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">Clearance</span>}
                      {!m.is_best_seller && !m.is_new && !m.is_deal && !m.is_clearance && "None"}
                    </span>
                  </dd>

                  {m.is_deal && (
                    <>
                      <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Deal text</dt>
                      <dd className="min-w-0 text-slate-900 text-sm sm:text-base">{m.deal_text ?? "Exclusive Deals Available"}</dd>
                    </>
                  )}

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Images</dt>
                  <dd className="min-w-0 text-slate-900 text-sm sm:text-base">
                    {m.imageUrls?.length ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {m.imageUrls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className="h-28 w-28 rounded-lg object-cover border border-slate-200 shadow-sm md:h-32 md:w-32 lg:h-40 lg:w-40"
                          />
                        ))}
                      </div>
                    ) : "None"}
                  </dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Created at</dt>
                  <dd className="min-w-0 text-slate-900 text-xs sm:text-sm">{m.createdAt ? new Date(m.createdAt).toLocaleString() : "None"}</dd>

                  <dt className="shrink-0 whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">Updated at</dt>
                  <dd className="min-w-0 text-slate-900 text-xs sm:text-sm">{m.updatedAt ? new Date(m.updatedAt).toLocaleString() : "None"}</dd>
                </dl>
              </div>
              <div className="flex shrink-0 gap-2 p-4 bg-slate-100 items-center justify-end sm:flex-col sm:justify-center sm:w-40 sm:min-w-0 md:w-44">
                <button
                  type="button"
                  onClick={() => {
                    setEditModel(m);
                    setSubmitError(null);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 md:text-base"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModelTarget(m)}
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
            {paginatedModels.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} models
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
            <div className="flex flex-wrap items-center justify-center gap-1">
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

      <CreateModelModal
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
      <EditModelModal
        model={editModel}
        onClose={() => setEditModel(null)}
        onSuccess={() => {
          setEditModel(null);
          load();
        }}
        token={auth?.token ?? ""}
        setSubmitError={setSubmitError}
        submitting={submitting}
        setSubmitting={setSubmitting}
        submitError={submitError}
      />
      <AdminDeleteConfirmModal
        open={!!deleteModelTarget}
        onClose={() => setDeleteModelTarget(null)}
        title="Delete model"
        itemLabel={deleteModelTarget?.name ?? ""}
        confirming={deleting}
        onConfirm={async () => {
          if (!auth?.token || !deleteModelTarget) return;
          setDeleting(true);
          try {
            await deleteModel(auth.token, deleteModelTarget.id);
            setDeleteModelTarget(null);
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

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function CreateModelModal({
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
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [flavorsStr, setFlavorsStr] = useState("");
  const [imageUrls, setImageUrls] = useState<(string | undefined)[]>([undefined, undefined, undefined]);
  const [chosenFileNames, setChosenFileNames] = useState<(string | undefined)[]>([undefined, undefined, undefined]);
  const [uploading, setUploading] = useState(false);
  const [is_clearance, setIsClearance] = useState(false);
  const [is_deal, setIsDeal] = useState(false);
  const [deal_text, setDealText] = useState("Exclusive Deals Available");
  const [is_best_seller, setIsBestSeller] = useState(false);
  const [is_new, setIsNew] = useState(false);
  const dealTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const buttonRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (submitError) {
      buttonRowRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [submitError]);

  useEffect(() => {
    const el = dealTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, el.scrollHeight)}px`;
  }, [deal_text, is_deal]);

  useEffect(() => {
    if (open) {
      setName("");
      setPrice("");
      setDescription("");
      setFlavorsStr("");
      setImageUrls([undefined, undefined, undefined]);
      setChosenFileNames([undefined, undefined, undefined]);
      setIsClearance(false);
      setIsDeal(false);
      setDealText("Exclusive Deals Available");
      setIsBestSeller(false);
      setIsNew(false);
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
    if (!price.trim()) {
      setSubmitError("Price is required.");
      return;
    }
    const priceNum = Number(price.trim());
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setSubmitError("Price must be a positive number.");
      return;
    }
    if (!token) {
      setSubmitError("Not authenticated.");
      return;
    }
    setSubmitting(true);
    try {
      await createModel(token, {
        name: name.trim(),
        price: priceNum,
        description: description.trim() || null,
        flavors: parseList(flavorsStr),
        imageUrls: imageUrls.filter((u): u is string => !!u),
        is_clearance,
        is_deal,
        deal_text: deal_text.trim() || null,
        is_best_seller,
        is_new,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create model");
    } finally {
      setSubmitting(false);
    }
  };

  const setImageAt = (index: number, url: string | undefined) => {
    setImageUrls((prev) => {
      const n = [...prev];
      while (n.length <= index) n.push(undefined);
      n[index] = url;
      return n;
    });
  };

  const imageLabels = ["First image", "Second image", "Third image"];

  return (
    <AdminModal title="Create model" open={open} onClose={onClose} size="wide">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSubmitError(null);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setSubmitError(null);
            }}
            placeholder="e.g. 9.99 (required, must be greater than 0)"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Description</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSubmitError(null);
            }}
            rows={4}
            className="mt-1 w-full min-h-[6rem] resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Flavors (comma-separated)</label>
          <textarea
            value={flavorsStr}
            onChange={(e) => {
              setFlavorsStr(e.target.value);
              setSubmitError(null);
            }}
            rows={2}
            className="mt-1 w-full min-h-[4rem] resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Images</p>
          <p className="mt-0.5 text-xs text-slate-600">Max 50KB per image.</p>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mt-3">
              <label className="block text-sm font-medium text-slate-800">{imageLabels[index]}</label>
              {imageUrls[index] && (
                <div className="relative inline-block mt-1">
                  <img
                    src={imageUrls[index]}
                    alt=""
                    className="h-28 w-28 rounded object-cover border border-slate-200 md:h-32 md:w-32 lg:h-40 lg:w-40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageAt(index, undefined);
                      setChosenFileNames((prev) => {
                        const n = [...prev];
                        n[index] = undefined;
                        return n;
                      });
                      setSubmitError(null);
                    }}
                    className="absolute -top-1 -right-1 rounded-full bg-rose-500 p-0.5 text-white hover:bg-rose-600"
                    aria-label="Remove image"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="relative mt-1 min-h-[2.25rem]">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !token) return;
                    if (file.size > 50 * 1024) {
                      setSubmitError("Image must be under 50KB.");
                      e.target.value = "";
                      return;
                    }
                    setChosenFileNames((prev) => {
                      const n = [...prev];
                      n[index] = file.name;
                      return n;
                    });
                    setSubmitError(null);
                    setUploading(true);
                    try {
                      const { url } = await uploadModelImage(token, file);
                      setImageAt(index, url);
                    } catch (err) {
                      setSubmitError(err instanceof Error ? err.message : "Upload failed.");
                    } finally {
                      setUploading(false);
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-2 text-sm text-slate-700 pointer-events-none">
                  {imageUrls[index] ? (
                    filenameFromUrl(imageUrls[index])
                  ) : chosenFileNames[index] ? (
                    chosenFileNames[index]
                  ) : (
                    <>
                      <span className="rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white">
                        Choose Image
                      </span>
                      <span>No image chosen</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_best_seller} onChange={(e) => { setIsBestSeller(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Best seller</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_new} onChange={(e) => { setIsNew(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">New</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_deal} onChange={(e) => { setIsDeal(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Deal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_clearance} onChange={(e) => { setIsClearance(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Clearance</span>
          </label>
        </div>
        {is_deal && (
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-800">Deal Text</label>
            <textarea
              ref={dealTextareaRef}
              value={deal_text}
              onChange={(e) => {
                setDealText(e.target.value);
                setSubmitError(null);
              }}
              placeholder="Exclusive Deals Available"
              rows={1}
              className="mt-1 w-full min-h-[2.5rem] overflow-hidden resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
            />
          </div>
        )}
        {submitError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
        )}
        <div ref={buttonRowRef} className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

function EditModelModal({
  model,
  onClose,
  onSuccess,
  token,
  setSubmitError,
  submitting,
  setSubmitting,
  submitError,
}: {
  model: ApiModel | null;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  setSubmitError: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  submitError: string | null;
}) {
  const [name, setName] = useState(model?.name ?? "");
  const [price, setPrice] = useState(model?.price != null ? String(model.price) : "");
  const [description, setDescription] = useState(model?.description ?? "");
  const [flavorsStr, setFlavorsStr] = useState((model?.flavors ?? []).join(", "));
  const [imageUrls, setImageUrls] = useState<(string | undefined)[]>([
    model?.imageUrls?.[0],
    model?.imageUrls?.[1],
    model?.imageUrls?.[2],
  ]);
  const [chosenFileNames, setChosenFileNames] = useState<(string | undefined)[]>([undefined, undefined, undefined]);
  const [uploading, setUploading] = useState(false);
  const [is_clearance, setIsClearance] = useState(model?.is_clearance ?? false);
  const [is_deal, setIsDeal] = useState(model?.is_deal ?? false);
  const [deal_text, setDealText] = useState(model?.deal_text ?? "Exclusive Deals Available");
  const [is_best_seller, setIsBestSeller] = useState(model?.is_best_seller ?? false);
  const [is_new, setIsNew] = useState(model?.is_new ?? false);
  const flavorsTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dealTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const buttonRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (submitError) {
      buttonRowRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [submitError]);

  useEffect(() => {
    const el = dealTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, el.scrollHeight)}px`;
  }, [deal_text, is_deal]);

  useEffect(() => {
    if (model) {
      setName(model.name ?? "");
      setPrice(model.price != null ? String(model.price) : "");
      setDescription(model.description ?? "");
      setFlavorsStr((model.flavors ?? []).join(", "));
      setImageUrls([model.imageUrls?.[0], model.imageUrls?.[1], model.imageUrls?.[2]]);
      setIsClearance(model.is_clearance ?? false);
      setIsDeal(model.is_deal ?? false);
      setDealText(model.deal_text ?? "Exclusive Deals Available");
      setIsBestSeller(model.is_best_seller ?? false);
      setIsNew(model.is_new ?? false);
      setSubmitError(null);
    }
  }, [model, setSubmitError]);

  useEffect(() => {
    const el = flavorsTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, el.scrollHeight)}px`;
  }, [flavorsStr]);

  useEffect(() => {
    const el = descriptionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, el.scrollHeight)}px`;
  }, [description]);

  if (!model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Name is required.");
      return;
    }
    if (!price.trim()) {
      setSubmitError("Price is required.");
      return;
    }
    const priceNum = Number(price.trim());
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setSubmitError("Price must be a positive number.");
      return;
    }
    if (!token) {
      setSubmitError("Not authenticated.");
      return;
    }
    setSubmitting(true);
    try {
      await updateModel(token, model.id, {
        name: name.trim(),
        price: priceNum,
        description: description.trim() || null,
        flavors: parseList(flavorsStr),
        imageUrls: imageUrls.filter((u): u is string => !!u),
        is_clearance,
        is_deal,
        deal_text: deal_text.trim() || null,
        is_best_seller,
        is_new,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update model");
    } finally {
      setSubmitting(false);
    }
  };

  const setImageAt = (index: number, url: string | undefined) => {
    setImageUrls((prev) => {
      const n = [...prev];
      while (n.length <= index) n.push(undefined);
      n[index] = url;
      return n;
    });
  };

  const imageLabels = ["First image", "Second image", "Third image"];

  return (
    <AdminModal title="Edit model" open={!!model} onClose={onClose} size="wide">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSubmitError(null); }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setSubmitError(null); }}
            placeholder="e.g. 9.99 (required, must be greater than 0)"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            ref={descriptionTextareaRef}
            value={description}
            onChange={(e) => { setDescription(e.target.value); setSubmitError(null); }}
            rows={1}
            className="mt-1 w-full min-h-[2.5rem] overflow-hidden resize-none rounded-lg border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Flavors (comma-separated)</label>
          <textarea
            ref={flavorsTextareaRef}
            value={flavorsStr}
            onChange={(e) => { setFlavorsStr(e.target.value); setSubmitError(null); }}
            rows={1}
            className="mt-1 w-full min-h-[2.5rem] overflow-hidden resize-none rounded-lg border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Images</p>
          <p className="mt-0.5 text-xs text-slate-500">Max 50KB per image.</p>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mt-3">
              <label className="block text-sm font-medium text-slate-600">{imageLabels[index]}</label>
              {imageUrls[index] && (
                <div className="relative inline-block mt-1">
                  <img
                    src={imageUrls[index]}
                    alt=""
                    className="h-28 w-28 rounded object-cover border border-slate-200 md:h-32 md:w-32 lg:h-40 lg:w-40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageAt(index, undefined);
                      setChosenFileNames((prev) => {
                        const n = [...prev];
                        n[index] = undefined;
                        return n;
                      });
                      setSubmitError(null);
                    }}
                    className="absolute -top-1 -right-1 rounded-full bg-rose-500 p-0.5 text-white hover:bg-rose-600"
                    aria-label="Remove image"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="relative mt-1 min-h-[2.25rem]">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !token) return;
                    if (file.size > 50 * 1024) {
                      setSubmitError("Image must be under 50KB.");
                      e.target.value = "";
                      return;
                    }
                    setChosenFileNames((prev) => {
                      const n = [...prev];
                      n[index] = file.name;
                      return n;
                    });
                    setSubmitError(null);
                    setUploading(true);
                    try {
                      const { url } = await uploadModelImage(token, file);
                      setImageAt(index, url);
                    } catch (err) {
                      setSubmitError(err instanceof Error ? err.message : "Upload failed.");
                    } finally {
                      setUploading(false);
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-2 text-sm text-slate-700 pointer-events-none">
                  {imageUrls[index] ? (
                    filenameFromUrl(imageUrls[index])
                  ) : chosenFileNames[index] ? (
                    chosenFileNames[index]
                  ) : (
                    <>
                      <span className="rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white">
                        Choose Image
                      </span>
                      <span>No image chosen</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_best_seller} onChange={(e) => { setIsBestSeller(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Best seller</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_new} onChange={(e) => { setIsNew(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">New</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_deal} onChange={(e) => { setIsDeal(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Deal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={is_clearance} onChange={(e) => { setIsClearance(e.target.checked); setSubmitError(null); }} />
            <span className="text-sm text-slate-700">Clearance</span>
          </label>
        </div>
        {is_deal && (
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-800">Deal Text</label>
            <textarea
              ref={dealTextareaRef}
              value={deal_text}
              onChange={(e) => { setDealText(e.target.value); setSubmitError(null); }}
              placeholder="Exclusive Deals Available"
              rows={1}
              className="mt-1 w-full min-h-[2.5rem] overflow-hidden resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900"
            />
          </div>
        )}
        {submitError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
        )}
        <div ref={buttonRowRef} className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
