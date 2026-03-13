"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Pagination } from "@/components/Pagination";
import { Skeleton } from "@/components/Skeleton";
import { Modal } from "@/components/Modal";

const MESSAGES_PER_PAGE = 20;

type SortKey = "name" | "email" | "subject" | "message" | "date";
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

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  repliedAt: string | null;
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
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100">
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Name</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Email</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Subject</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Message</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Date</th>
            <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Replied</th>
            {showActions && <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-24" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-32" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-20" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-40" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-20" /></td>
              <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-4 w-16" /></td>
              {showActions && <td className="px-3 py-2.5 sm:px-4"><Skeleton className="h-7 w-16" /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const { can } = useAuth();
  const [list, setList] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const canReply = can("message", "reply");
  const canDelete = can("message", "delete");
  const hasMessagePrivilege = canReply || canDelete;

  const handleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDir((prev) =>
      sortKey === key ? (prev === "asc" ? "desc" : "asc") : key === "date" ? "desc" : "asc"
    );
  };

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/messages");
      if (!res.ok) throw new Error("Failed to load messages");
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
    let out = q
      ? list.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.subject ?? "").toLowerCase().includes(q) ||
            m.message.toLowerCase().includes(q)
        )
      : [...list];
    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      else if (sortKey === "email") cmp = a.email.localeCompare(b.email, undefined, { sensitivity: "base" });
      else if (sortKey === "subject") cmp = (a.subject ?? "").localeCompare(b.subject ?? "", undefined, { sensitivity: "base" });
      else if (sortKey === "message") cmp = a.message.localeCompare(b.message, undefined, { sensitivity: "base" });
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [list, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredAndSorted.length / MESSAGES_PER_PAGE) || 1;
  const paginatedList = filteredAndSorted.slice((page - 1) * MESSAGES_PER_PAGE, page * MESSAGES_PER_PAGE);
  const totalCount = filteredAndSorted.length;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * MESSAGES_PER_PAGE + 1;
  const rangeEnd = Math.min(page * MESSAGES_PER_PAGE, totalCount);

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) setPage(1);
  }, [page, totalPages]);

  const openReplyModal = (m: Message) => {
    setReplyingTo(m);
    setReplyBody("");
    setReplyError(null);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setReplyingTo(null);
    setReplyBody("");
    setReplyError(null);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyBody.trim()) return;
    setReplySubmitting(true);
    setReplyError(null);
    try {
      const res = await fetchWithAuth(`/api/messages/${replyingTo.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyBody: replyBody.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to send reply");
      closeReplyModal();
      await load();
      // Refetch after a short delay so "Replied" column updates once the background email send completes
      setTimeout(() => load(), 2500);
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete || !confirm("Delete this message?")) return;
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/messages/${id}`, { method: "DELETE" });
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

        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Messages</h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {!loading && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="msg-search">Search messages</label>
            <input
              id="msg-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, subject, or message…"
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
          <TableSkeleton showActions={hasMessagePrivilege} />
        ) : filteredAndSorted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-500">
            {search.trim() ? "No messages match your search." : "No messages yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <SortableTh label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Email" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Subject" sortKey="subject" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Message" sortKey="message" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <SortableTh label="Date" sortKey="date" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4 whitespace-nowrap">Replied</th>
                    {hasMessagePrivilege && (
                      <th className="px-3 py-2.5 font-medium text-slate-700 sm:px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-medium text-slate-900 sm:px-4">{m.name}</td>
                      <td className="px-3 py-2.5 text-slate-600 sm:px-4">{m.email}</td>
                      <td className="px-3 py-2.5 text-slate-700 sm:px-4">{m.subject ? `Re: ${m.subject}` : "—"}</td>
                      <td className="max-w-[200px] px-3 py-2.5 text-slate-600 sm:px-4">
                        <span className="line-clamp-2" title={m.message}>{m.message}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500 sm:px-4">{formatDateTime(m.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500 sm:px-4">
                        {m.repliedAt ? formatDateTime(m.repliedAt) : "Unreplied"}
                      </td>
                      {hasMessagePrivilege && (
                        <td className="px-3 py-2.5 sm:px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {canReply && (
                              <button
                                type="button"
                                onClick={() => openReplyModal(m)}
                                className="cursor-pointer rounded border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300"
                              >
                                Reply
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(m.id)}
                                className="cursor-pointer rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 hover:border-red-300"
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

        <Modal open={replyModalOpen} onClose={closeReplyModal} title="Reply to message">
          {replyingTo && (
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-700">To:</span> {replyingTo.name} &lt;{replyingTo.email}&gt;</p>
                {replyingTo.subject && <p><span className="font-medium text-slate-700">Subject:</span> Re: {replyingTo.subject}</p>}
              </div>
              <div>
                <label htmlFor="reply-body" className="mb-1 block text-sm font-medium text-slate-700">Your reply</label>
                <textarea
                  id="reply-body"
                  required
                  rows={6}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {replyError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{replyError}</div>
              )}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyBody.trim()}
                  className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {replySubmitting ? "Sending…" : "Send reply"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </RequireAuth>
  );
}
