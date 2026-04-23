"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch } from "../../../lib/api";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { CardGridSkeleton } from "@/components/Skeleton";
import { usePerPage } from "../../../lib/usePerPage";

type Privilege = {
  resource: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canReply?: boolean;
};
type Moderator = {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  privileges: Privilege[];
  createdAt?: string;
  updatedAt?: string;
};

const RESOURCES = ["category", "brand", "product", "model", "message", "newsletter"] as const;

/** Whether the privilege checkbox should be disabled for this resource/action. */
function isPrivDisabled(resource: string, key: "create" | "update" | "delete" | "reply"): boolean {
  if (resource === "message") return key === "create" || key === "update";
  if (resource === "newsletter") return key === "create" || key === "reply";
  if (["category", "brand", "product", "model"].includes(resource)) return key === "reply";
  return false;
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

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

export default function ModeratorsPage() {
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const [list, setList] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addPrivs, setAddPrivs] = useState<
    Record<string, { create: boolean; update: boolean; delete: boolean; reply: boolean }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = usePerPage();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editPrivs, setEditPrivs] = useState<
    Record<string, { create: boolean; update: boolean; delete: boolean; reply: boolean }>
  >({});

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Moderator | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const url = params.toString() ? `/api/admin/subadmins?${params}` : "/api/admin/subadmins";
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to load moderators");
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || !addEmail.trim() || !addPassword) return;
    setSubmitting(true);
    setError(null);
    try {
      const privileges = RESOURCES.map((resource) => ({
        resource,
        canCreate: addPrivs[resource]?.create ?? false,
        canUpdate: addPrivs[resource]?.update ?? false,
        canDelete: addPrivs[resource]?.delete ?? false,
        canReply: addPrivs[resource]?.reply ?? false,
      }));
      const res = await fetchWithAuth("/api/admin/subadmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: addUsername.trim(),
          email: addEmail.trim(),
          password: addPassword,
          privileges,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || "Create failed");
      }
      setAddUsername("");
      setAddEmail("");
      setAddPassword("");
      setAddPrivs({});
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/subadmins/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Deactivate failed");
      setDeactivateModalOpen(false);
      setDeactivateTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deactivate failed");
    }
  };

  const openDeactivateModal = (m: Moderator) => {
    setDeactivateTarget(m);
    setError(null);
    setDeactivateModalOpen(true);
  };

  const handleActivate = async (id: string) => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/subadmins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || "Activate failed");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activate failed");
    }
  };

  const togglePriv = (resource: string, key: "create" | "update" | "delete" | "reply") => {
    setAddPrivs((prev) => ({
      ...prev,
      [resource]: {
        create: prev[resource]?.create ?? false,
        update: prev[resource]?.update ?? false,
        delete: prev[resource]?.delete ?? false,
        reply: prev[resource]?.reply ?? false,
        [key]: !prev[resource]?.[key],
      },
    }));
  };

  const toggleEditPriv = (resource: string, key: "create" | "update" | "delete" | "reply") => {
    setEditPrivs((prev) => ({
      ...prev,
      [resource]: {
        create: prev[resource]?.create ?? false,
        update: prev[resource]?.update ?? false,
        delete: prev[resource]?.delete ?? false,
        reply: prev[resource]?.reply ?? false,
        [key]: !prev[resource]?.[key],
      },
    }));
  };

  const openEditModal = (m: Moderator) => {
    setEditingId(m.id);
    setEditUsername(m.username);
    setEditEmail(m.email);
    setEditIsActive(m.isActive);
    setEditNewPassword("");
    setEditShowPassword(false);
    setEditPrivs(
      RESOURCES.reduce(
        (acc, res) => {
          const p = m.privileges?.find((x) => x.resource === res);
          acc[res] = {
            create: p?.canCreate ?? false,
            update: p?.canUpdate ?? false,
            delete: p?.canDelete ?? false,
            reply: p?.canReply ?? false,
          };
          return acc;
        },
        {} as Record<string, { create: boolean; update: boolean; delete: boolean; reply: boolean }>
      )
    );
    setError(null);
    setEditModalOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editUsername.trim() || !editEmail.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: { username: string; email: string; isActive: boolean; newPassword?: string } = {
        username: editUsername.trim(),
        email: editEmail.trim(),
        isActive: editIsActive,
      };
      if (editNewPassword.trim()) body.newPassword = editNewPassword;
      const res = await fetchWithAuth(`/api/admin/subadmins/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || "Update failed");
      }
      const privileges = RESOURCES.map((resource) => ({
        resource,
        canCreate: editPrivs[resource]?.create ?? false,
        canUpdate: editPrivs[resource]?.update ?? false,
        canDelete: editPrivs[resource]?.delete ?? false,
        canReply: editPrivs[resource]?.reply ?? false,
      }));
      const privRes = await fetchWithAuth(`/api/admin/subadmins/${editingId}/privileges`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privileges }),
      });
      if (!privRes.ok) throw new Error("Failed to update privileges");
      setEditModalOpen(false);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setAddUsername("");
    setAddEmail("");
    setAddPassword("");
    setAddPrivs({});
    setError(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  return (
    <RequireAuth requiredRole="admin">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600 hover:underline"
          >
            <svg className="h-4 w-4 shrink-0 transition-colors group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={openModal}
            className="shrink-0 rounded-xl bg-indigo-200 px-5 py-2.5 text-sm font-medium text-indigo-800 shadow-sm transition cursor-pointer hover:bg-indigo-600 hover:text-white sm:w-auto"
          >
            Create
          </button>
        </section>

        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">All Moderators</h1>

        <div>
          <label className="sr-only" htmlFor="mod-search">Search by username or email</label>
          <input
            id="mod-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email…"
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create moderator">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="moderator1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="mod@example.com"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-11 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Privileges</span>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5">Resource</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Create</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Edit</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Delete</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Reply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map((res) => (
                      <tr key={res} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-2 font-medium capitalize text-slate-900 sm:px-4 sm:py-2.5">{res}</td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "create") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={addPrivs[res]?.create ?? false} onChange={() => togglePriv(res, "create")} disabled={isPrivDisabled(res, "create")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "update") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={addPrivs[res]?.update ?? false} onChange={() => togglePriv(res, "update")} disabled={isPrivDisabled(res, "update")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "delete") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={addPrivs[res]?.delete ?? false} onChange={() => togglePriv(res, "delete")} disabled={isPrivDisabled(res, "delete")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "reply") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={addPrivs[res]?.reply ?? false} onChange={() => togglePriv(res, "reply")} disabled={isPrivDisabled(res, "reply")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                {submitting ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit moderator">
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">Active (can sign in)</span>
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New password (optional)</label>
              <div className="relative flex">
                <input
                  type={editShowPassword ? "text" : "password"}
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-11 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Leave empty to keep current"
                />
                <button
                  type="button"
                  onClick={() => setEditShowPassword((p) => !p)}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={editShowPassword ? "Hide password" : "Show password"}
                  title={editShowPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon show={editShowPassword} />
                </button>
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Privileges</span>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5">Resource</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Create</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Edit</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Delete</th>
                      <th className="px-3 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5 text-center">Reply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map((res) => (
                      <tr key={res} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-2 font-medium capitalize text-slate-900 sm:px-4 sm:py-2.5">{res}</td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "create") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={editPrivs[res]?.create ?? false} onChange={() => toggleEditPriv(res, "create")} disabled={isPrivDisabled(res, "create")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "update") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={editPrivs[res]?.update ?? false} onChange={() => toggleEditPriv(res, "update")} disabled={isPrivDisabled(res, "update")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "delete") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={editPrivs[res]?.delete ?? false} onChange={() => toggleEditPriv(res, "delete")} disabled={isPrivDisabled(res, "delete")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                        <td className="px-3 py-2 text-center sm:px-4 sm:py-2.5">
                          <label className={`inline-flex items-center justify-center ${isPrivDisabled(res, "reply") ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input type="checkbox" checked={editPrivs[res]?.reply ?? false} onChange={() => toggleEditPriv(res, "reply")} disabled={isPrivDisabled(res, "reply")} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>

        {error && !modalOpen && !editModalOpen && !deactivateModalOpen && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Modal
          open={deactivateModalOpen}
          onClose={() => {
            setDeactivateModalOpen(false);
            setDeactivateTarget(null);
          }}
          title="Deactivate moderator"
        >
          <div className="space-y-4">
            {deactivateTarget && (
              <>
                <p className="text-slate-700">
                  Deactivate <strong className="font-semibold text-slate-900">{deactivateTarget.username}</strong>? They will no longer be able to sign in.
                </p>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeactivateModalOpen(false);
                      setDeactivateTarget(null);
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deactivateTarget && handleDeactivate(deactivateTarget.id)}
                    className="cursor-pointer rounded-lg border border-red-200 bg-red-50/80 px-4 py-2 text-sm font-medium text-red-600 opacity-90 shadow-sm transition hover:opacity-100 hover:border-red-300 hover:bg-red-100 hover:shadow"
                  >
                    Deactivate
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
        {loading ? (
          <CardGridSkeleton />
        ) : (
          <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedList.map((m) => (
              <article
                key={m.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-lg hover:ring-slate-300/60"
              >
                {/* Header: username centered */}
                <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-100 via-indigo-50/90 to-violet-100/80 px-4 py-3">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                    <h2 className="w-full text-center text-lg font-semibold leading-tight text-slate-900 truncate" title={m.username}>{m.username}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${m.isActive ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/50" : "bg-amber-50 text-amber-800 ring-1 ring-amber-200/60"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="space-y-1.5 rounded-xl bg-slate-50/80 px-3 py-2">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="shrink-0 font-medium text-slate-500">Email</span>
                      <span className="truncate text-right text-slate-800" title={m.email}>{m.email}</span>
                    </div>
                  </div>
                  {/* Privileges: artistic grid */}
                  <div className="mt-2 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/90 via-indigo-50/20 to-slate-50/90 p-2 shadow-inner">
                    <p className="mb-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">Privileges</p>
                    <p className="mb-2 text-center text-[10px] text-slate-400">C Create · E Edit · D Delete · R Reply</p>
                    {m.privileges?.length ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {m.privileges.map((p) => {
                          const hasAny = p.canCreate || p.canUpdate || p.canDelete || p.canReply;
                          return (
                            <div
                              key={p.resource}
                              className={`rounded-lg border p-1.5 text-center shadow-sm transition ${hasAny ? "border-indigo-200/70 bg-white/90" : "border-slate-200/60 bg-white/60"}`}
                            >
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                {p.resource}
                              </p>
                              <div className="flex items-center justify-center gap-0.5">
                                <span title="Create" className={`inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${p.canCreate ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-300"}`}>C</span>
                                <span title="Edit" className={`inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${p.canUpdate ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-300"}`}>E</span>
                                <span title="Delete" className={`inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${p.canDelete ? "bg-rose-500 text-white shadow-sm" : "bg-slate-100 text-slate-300"}`}>D</span>
                                <span title="Reply" className={`inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${p.canReply ? "bg-violet-500 text-white shadow-sm" : "bg-slate-100 text-slate-300"}`}>R</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-xs text-slate-400">No privileges</p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-2 text-center text-xs text-slate-400" title={`Created ${formatDateTime(m.createdAt)} · Updated ${formatDateTime(m.updatedAt)}`}>
                    <span>Added {formatDateCard(m.createdAt)}</span>
                    <span className="text-slate-300">·</span>
                    <span>Updated {formatDateCard(m.updatedAt)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow"
                    >
                      Edit
                    </button>
                    {m.isActive ? (
                      <button
                        type="button"
                        onClick={() => openDeactivateModal(m)}
                        className="cursor-pointer rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-sm font-medium text-red-600 opacity-90 shadow-sm transition hover:opacity-100 hover:border-red-300 hover:bg-red-100 hover:shadow"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(m.id)}
                        className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-sm font-medium text-emerald-700 opacity-90 shadow-sm transition hover:opacity-100 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {list.length === 0 && (
              <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center text-slate-500">
                No moderators found.
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

