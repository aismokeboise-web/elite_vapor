"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuthenticatedFetch } from "../../../lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { ProfileSkeleton } from "@/components/Skeleton";

type Profile = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "subadmin";
};

export default function ProfilePage() {
  const fetchWithAuth = useAuthenticatedFetch();
  const { role, hasLoggedInOnce } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editProfileError, setEditProfileError] = useState<string | null>(null);
  const [editProfileSubmitting, setEditProfileSubmitting] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);

  const isAdmin = role === "admin";
  const canChangePassword = isAdmin || (role === "subadmin" && hasLoggedInOnce === true);

  const loadProfile = async () => {
    setError(null);
    try {
      const res = await fetchWithAuth("/api/auth/me");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [fetchWithAuth]);

  const openEditProfile = () => {
    if (profile) {
      setEditUsername(profile.username);
      setEditEmail(profile.email);
      setEditPassword("");
      setEditProfileError(null);
      setEditProfileOpen(true);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProfileError(null);
    if (!editUsername.trim() || !editEmail.trim()) {
      setEditProfileError("Username and email are required.");
      return;
    }
    if (!editPassword) {
      setEditProfileError("Enter your current password to confirm changes.");
      return;
    }
    setEditProfileSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/auth/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editUsername.trim(),
          email: editEmail.trim(),
          password: editPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        username?: string;
        email?: string;
        role?: "admin" | "subadmin";
        error?: string;
      };
      if (!res.ok) {
        setEditProfileError(data.error || "Update failed.");
        return;
      }
      // The API returns id, username, email; ensure we shape it into a Profile
      setProfile({
        id: data.id ?? profile!.id,
        username: data.username ?? profile!.username,
        email: data.email ?? profile!.email,
        role: "admin",
      });
      setEditProfileOpen(false);
      setEditPassword("");
    } finally {
      setEditProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    if (newPassword !== confirmPassword) {
      setChangePasswordError("New password and confirmation do not match.");
      return;
    }
    setChangePasswordSubmitting(true);
    try {
      const endpoint = isAdmin
        ? "/api/auth/admin/change-password"
        : "/api/auth/subadmin/change-password";
      const res = await fetchWithAuth(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setChangePasswordError(data.error || "Failed to change password.");
        return;
      }
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setChangePasswordSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="space-y-6">

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <div className="space-y-6">
            <section className="admin-card overflow-hidden rounded-2xl border border-slate-200/80 shadow-lg shadow-indigo-900/5">
              {/* Header strip with avatar and name */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-indigo-50/80 px-6 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700 ring-2 ring-indigo-200/60 shadow-inner">
                    {(profile.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{profile.username}</h1>
                    <p className="mt-0.5 truncate text-sm text-slate-600">{profile.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200/50">
                      {profile.role === "admin" ? "Admin" : "Moderator"}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openEditProfile}
                      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:shadow"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                      Edit profile
                    </button>
                  )}
                </div>
              </div>
              {/* Details list */}
              <div className="divide-y divide-slate-100">
                <div className="flex flex-wrap items-center gap-3 px-6 py-4 sm:px-8 sm:py-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-24">Username</span>
                  <span className="font-medium text-slate-900">{profile.username}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 px-6 py-4 sm:px-8 sm:py-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-24">Email</span>
                  <a href={`mailto:${profile.email}`} className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                    {profile.email}
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-3 px-6 py-4 sm:px-8 sm:py-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-24">Role</span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 ring-1 ring-indigo-200/50">
                    {profile.role === "admin" ? "Admin" : "Moderator"}
                  </span>
                </div>
              </div>
            </section>

            {canChangePassword && (
              <section className="admin-card p-6 sm:p-8">
                <h2 className="text-sm font-semibold text-slate-900">Password</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Change your password. Use a strong password with at least 8 characters, one uppercase letter, one number, and one symbol.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordError(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setChangePasswordOpen(true);
                  }}
                  className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition cursor-pointer hover:bg-indigo-100"
                >
                  Change password
                </button>
              </section>
            )}
          </div>
        ) : null}
      </div>

      {/* Edit profile modal (admin only) */}
      <Modal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit profile">
        <form onSubmit={handleEditProfile} className="space-y-4">
          <p className="text-sm text-slate-600">
            Update your username or email. Enter your current password to confirm.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="••••••••"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Required to confirm changes.</p>
          </div>
          {editProfileError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {editProfileError}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditProfileOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition cursor-pointer hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editProfileSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/30 transition cursor-pointer hover:bg-indigo-500 disabled:opacity-50"
            >
              {editProfileSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change password modal */}
      <Modal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} title="Change password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="••••••••"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters, one uppercase letter, one number, one symbol.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              placeholder="••••••••"
              required
            />
          </div>
          {changePasswordError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {changePasswordError}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition cursor-pointer hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePasswordSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/30 transition cursor-pointer hover:bg-indigo-500 disabled:opacity-50"
            >
              {changePasswordSubmitting ? "Updating…" : "Change password"}
            </button>
          </div>
        </form>
      </Modal>
    </RequireAuth>
  );
}
