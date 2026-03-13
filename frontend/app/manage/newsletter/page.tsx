"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Pagination } from "@/components/Pagination";
import { Skeleton } from "@/components/Skeleton";

const NEWSLETTER_PER_PAGE = 20;

type SortKey = "email" | "status" | "subscribed";
type SortDir = "asc" | "desc";

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  const className = `ml-1 h-4 w-4 ${active ? "text-indigo-600" : "text-slate-400"}`;
  return dir === "asc" ? (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <title>Ascending</title>
      <path d="M10 4l-6 6h12L10 4z" />
    </svg>
  ) : (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <title>Descending</title>
      <path d="M10 16l6-6H4l6 6z" />
    </svg>
  );
}

function SortableTh({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded"
      >
        {label}
        <SortArrow active={active} dir={active ? currentDir : "asc"} />
      </button>
    </th>
  );
}

type Subscription = {
  id: number;
  email: string;
  active: boolean;
  createdAt: string;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function TableSkeleton({ rows = 5, showActions = true }: { rows?: number; showActions?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100">
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Email</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Status</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Subscribed</th>
            {showActions && <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-40" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-24" /></td>
              {showActions && <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-7 w-20" /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NewsletterPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("subscribed");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const canUpdate = can("newsletter", "update");
  const canDelete = can("newsletter", "delete");
  const hasNewsletterPrivilege = canUpdate || canDelete;

  const handleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDir((prev) =>
      sortKey === key ? (prev === "asc" ? "desc" : "asc") : key === "subscribed" ? "desc" : "asc"
    );
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/newsletter");
      if (!res.ok) throw new Error("Failed to load subscriptions");
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
  }, []);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = q ? list.filter((s) => s.email.toLowerCase().includes(q)) : [...list];
    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "email") cmp = a.email.localeCompare(b.email, undefined, { sensitivity: "base" });
      else if (sortKey === "status") cmp = (a.active ? 1 : 0) - (b.active ? 1 : 0);
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [list, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredAndSorted.length / NEWSLETTER_PER_PAGE) || 1;
  const paginatedList = filteredAndSorted.slice((page - 1) * NEWSLETTER_PER_PAGE, page * NEWSLETTER_PER_PAGE);
  const totalCount = filteredAndSorted.length;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * NEWSLETTER_PER_PAGE + 1;
  const rangeEnd = Math.min(page * NEWSLETTER_PER_PAGE, totalCount);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  const handleUnsubscribe = async (id: number) => {
    if (!canUpdate) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/newsletter/${id}/unsubscribe`, { method: "POST" });
      if (!res.ok) throw new Error("Unsubscribe failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unsubscribe failed");
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    if (!canUpdate) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/newsletter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete || !confirm("Delete this subscription?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/newsletter/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600 hover:underline"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </section>

        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Newsletter subscriptions</h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {!loading && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="news-search">Search by email</label>
            <input
              id="news-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by email…"
              className="min-w-[200px] max-w-md flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        )}

        {!loading && filteredAndSorted.length > 0 && (
          <p className="text-sm text-slate-600">
            Showing {rangeStart}–{rangeEnd} of {totalCount}
          </p>
        )}

        {!loading && filteredAndSorted.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredAndSorted.length}
            onPageChange={setPage}
          />
        )}

        {loading ? (
          <TableSkeleton showActions={hasNewsletterPrivilege} />
        ) : filteredAndSorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-500">
            {search.trim() ? "No subscriptions match your search." : "No subscriptions yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <SortableTh label="Email" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Subscribed" sortKey="subscribed" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    {hasNewsletterPrivilege && (
                      <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4 break-all">{s.email}</td>
                      <td className="px-3 py-2.5 sm:px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            s.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.active ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500 sm:px-4">
                        {formatDateTime(s.createdAt)}
                      </td>
                      {hasNewsletterPrivilege && (
                        <td className="px-3 py-2.5 sm:px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {canUpdate && (
                              <>
                                {s.active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnsubscribe(s.id)}
                                    className="cursor-pointer rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                                  >
                                    Unsubscribe
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(s.id, true)}
                                    className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                className="cursor-pointer rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredAndSorted.length}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
