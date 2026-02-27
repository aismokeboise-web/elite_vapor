import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminAuth } from "../auth";
import {
  fetchAdminMessages,
  deleteAdminMessage,
  updateAdminMessageReadStatus,
  getFriendlyErrorMessage,
} from "../../api/client";
import type { ApiMessage } from "../../api/client";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminErrorAlert } from "../components/AdminErrorAlert";
import { AdminSkeleton } from "../components/AdminSkeleton";
import { useScrollToTopOnPageChange } from "../useScrollToTopOnPageChange";

type SortKey = "name" | "email" | "subject" | "createdAt";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "read" | "unread";

const PAGE_SIZE = 20;

export function AdminMessagesPage() {
  const [messages, setMessages] = useState<ApiMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortKey] = useState<SortKey>("createdAt");
  const [sortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ApiMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const auth = getAdminAuth();
  const token = auth?.token;

  useScrollToTopOnPageChange(currentPage);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchAdminMessages(token)
      .then(setMessages)
      .catch((e) => setError(getFriendlyErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }
    load();
  }, [token, load]);

  const filteredAndSorted = useMemo(() => {
    let list = messages ?? [];
    if (statusFilter === "read") {
      list = list.filter((m) => m.isRead);
    } else if (statusFilter === "unread") {
      list = list.filter((m) => !m.isRead);
    }
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
  }, [messages, filter, sortKey, sortOrder, statusFilter]);

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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search messages…"
          className="w-full max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:max-w-md lg:max-w-lg"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 sm:text-sm">Status:</span>
          <div className="inline-flex rounded-full border border-slate-300 bg-white p-0.5 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-3 py-1 font-medium ${
                statusFilter === "all"
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unread")}
              className={`rounded-full px-3 py-1 font-medium ${
                statusFilter === "unread"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("read")}
              className={`rounded-full px-3 py-1 font-medium ${
                statusFilter === "read"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Read
            </button>
          </div>
        </div>
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
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
              <span className="inline sm:hidden" aria-hidden="true">←</span>
              <span className="hidden sm:inline">Previous</span>
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
              <span className="inline sm:hidden" aria-hidden="true">→</span>
              <span className="hidden sm:inline">Next</span>
            </button>
          </div>
        </div>
      )}

      {/* One message per row, responsive cards */}
      <div className="mt-6 space-y-3">
        {paginatedMessages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-600">Name</p>
                <h2 className="text-base font-semibold text-slate-900">{m.name}</h2>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-600">Email</p>
                <p className="text-xs text-slate-600">{m.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[0.7rem] text-slate-500">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                    m.isRead
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  {m.isRead ? "Read" : "Unread"}
                </span>
                <span>
                  <span className="font-semibold text-slate-600">Date: </span>
                  {m.createdAt ? new Date(m.createdAt).toLocaleString() : "None"}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-600">Subject</p>
            <p className="text-xs font-medium text-slate-700">
              {m.subject ?? "No subject"}
            </p>
            <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-600">Message</p>
            <p className="text-xs text-slate-700 whitespace-pre-line break-words">
              {m.message}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
              <button
                type="button"
                onClick={async () => {
                  if (!auth?.token) return;
                  try {
                    await updateAdminMessageReadStatus(auth.token, m.id, !m.isRead);
                    load();
                  } catch (e) {
                    setError(getFriendlyErrorMessage(e));
                  }
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 hover:shadow-sm"
              >
                {m.isRead ? "Mark as unread" : "Mark as read"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(m)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
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
