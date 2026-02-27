import { useEffect, useState } from "react";
import { getAdminAuth, setAdminAuth } from "../auth";
import {
  getFriendlyErrorMessage,
  updateAdminAccount,
  fetchAdminAccount,
  type AdminAccountProfile,
} from "../../api/client";

export function AdminAccountPage() {
  const auth = getAdminAuth();

  const [profile, setProfile] = useState<AdminAccountProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchAdminAccount(auth.token);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(getFriendlyErrorMessage(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth]);

  if (!auth) {
    // AdminLayout should already guard this, but we keep a defensive check.
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Account settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You must be signed in to manage your account.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    const trimmedUsername = newUsername.trim();
    const hasNewUsername = !!trimmedUsername;
    const hasNewPassword = !!newPassword || !!confirmNewPassword;

    if (!hasNewUsername && !hasNewPassword) {
      setError("Enter a new username or a new password to update your account.");
      return;
    }

    if (hasNewUsername && hasNewPassword) {
      setError(
        "You can change either your username or your password at one time, not both. Please clear one of them and try again."
      );
      return;
    }

    if (hasNewPassword) {
      if (!newPassword || !confirmNewPassword) {
        setError("Please enter and confirm your new password.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const body: { currentPassword: string; newPassword?: string; newUsername?: string } = {
        currentPassword,
      };
      if (hasNewUsername) body.newUsername = trimmedUsername;
      if (hasNewPassword) body.newPassword = newPassword;

      const result = await updateAdminAccount(auth.token, body);

      if (!result.success) {
        setError("Failed to update account. Please try again.");
        return;
      }

      if (result.token && typeof result.expiresAt === "number") {
        setAdminAuth({ token: result.token, expiresAt: result.expiresAt });
      }

      setSuccess("Your account has been updated.");
      setNewPassword("");
      setConfirmNewPassword("");
      // Keep currentPassword so user can see it was used; they can clear if they want.
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
        Account settings
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Change your admin username or password. You&apos;ll need to confirm with your current
        password before saving changes, and you can update either username or password in a single
        update (not both at once).
      </p>

      {profile && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm space-y-2">
          <div>
            <div className="font-medium text-slate-700">Current username</div>
            <div className="mt-0.5 text-slate-900 break-all">{profile.username}</div>
          </div>
          <div>
            <div className="font-medium text-slate-700">Email</div>
            <div className="mt-0.5 text-slate-900 break-all">{profile.email}</div>
          </div>
        </div>
      )}
      {profileError && (
        <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          {profileError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              autoComplete="username"
              placeholder="Leave blank to keep current"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
          >
            {submitting ? "Saving changes…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

