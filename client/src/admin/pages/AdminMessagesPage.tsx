import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminAuth } from "../auth";
import { fetchAdminMessages, deleteAdminMessage, getFriendlyErrorMessage } from "../../api/client";
import type { ApiMessage } from "../../api/client";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminErrorAlert } from "../components/AdminErrorAlert";
import { AdminSkeleton } from "../components/AdminSkeleton";
import { useScrollToTopOnPageChange } from "../useScrollToTopOnPageChange";

type SortKey = "name" | "email" | "subject" | "createdAt";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 20;

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ApiMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ApiMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const auth = getAdminAuth();

  useScrollToTopOnPageChange(currentPage);

  const load = useCallback(() => {
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    fetchAdminMessages(auth.token)
      .then(setMessages)
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }
    load();
  }, [auth?.token, load]);

  const filteredAndSorted = useMemo(() => {
    let list = messages ?? [];
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          (m.name ?? "").toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q) ||
          (m.subject ?? "").toLowerCase().includes(q) ||
          (m.message ?? "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });
      } else if (sortKey === "email") {
        cmp = (a.email ?? "").localeCompare(b.email ?? "", undefined, { sensitivity: "base" });
      } else if (sortKey === "subject") {
        cmp = (a.subject ?? "").localeCompare(b.subject ?? "", undefined, { sensitivity: "base" });
      } else {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        cmp = at - bt;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [messages, filter, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  const paginatedMessages = useMemo(
    () => filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredAndSorted, currentPage]
  );

  if (loading) {
    return <AdminSkeleton title="Messages" tableRows={8} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Messages</h1>
        <div className="mt-6">
          <AdminErrorAlert message={error} title="Couldn't load messages" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Contact Messages</h1>
      <p className="mt-2 text-base text-slate-600">
        {filteredAndSorted.length} {(filteredAndSorted.length === 1) ? "message" : "messages"}
      </p>

      <div className="mt-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search messages…"
          className="w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:max-w-md lg:max-w-lg"
        />
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:text-sm">
          <span className="text-[0.7rem] font-semibold tracking-tight text-slate-600 sm:text-xs">
            Showing{" "}
            {(currentPage - 1) * PAGE_SIZE + 1}
            {"–"}
            {Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} messages
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
                <button type="button" onClick={() => toggleSort("email")} className="hover:text-slate-800">
                  Email {sortKey === "email" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-left font-semibold">
                <button type="button" onClick={() => toggleSort("subject")} className="hover:text-slate-800">
                  Subject {sortKey === "subject" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-left font-semibold">Message</th>
              <th className="px-5 py-4 text-left font-semibold">
                <button type="button" onClick={() => toggleSort("createdAt")} className="hover:text-slate-800">
                  Date {sortKey === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              </th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMessages.map((m) => (
              <tr key={m.id} className="border-t border-slate-200">
                <td className="px-5 py-3 font-medium text-slate-800">{m.name}</td>
                <td className="px-5 py-3 text-slate-600">{m.email}</td>
                <td className="px-5 py-3 text-slate-600">{m.subject ?? "None"}</td>
                <td className="max-w-xs truncate px-5 py-3 text-slate-600" title={m.message}>
                  {m.message}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString() : "None"}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(m)}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
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
            {filteredAndSorted.length} messages
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

      <AdminDeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete message"
        actionVerb="delete message"
        itemLabel={deleteTarget ? `from ${deleteTarget.email}` : ""}
        confirming={deleting}
        onConfirm={async () => {
          if (!auth?.token || !deleteTarget) return;
          setDeleting(true);
          try {
            await deleteAdminMessage(auth.token, deleteTarget.id);
            setDeleteTarget(null);
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
