import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getFriendlyErrorMessage, resetAdminPassword, verifyAdminResetToken } from "../api/client";

export function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setChecking(false);
        setValid(false);
        setError("This password reset link is invalid.");
        return;
      }

      try {
        const result = await verifyAdminResetToken({ token });
        if (cancelled) return;

        if (result.valid) {
          setValid(true);
          setUsername(result.username);
          setError(null);
        } else {
          setValid(false);
          setError("This password reset link is invalid or has expired.");
        }
      } catch (err) {
        if (cancelled) return;
        setValid(false);
        setError("This password reset link is invalid or has expired.");
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !token) return;

    setError(null);

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      await resetAdminPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const title = success ? "Password reset successful" : "Set a new password";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg shadow-slate-200/50">
        <h1 className="text-xl font-semibold text-slate-800 text-center">
          {title}
        </h1>

        {checking && (
          <p className="mt-4 text-sm text-slate-600 text-center">
            Validating your reset link…
          </p>
        )}

        {!checking && !success && error && (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
            <div className="text-center">
              <Link
                to="/admin/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Request a new password reset link
              </Link>
            </div>
          </div>
        )}

        {!checking && !success && valid && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
            {username && (
              <p className="text-xs text-slate-500 text-center">
                Resetting password for <span className="font-medium">{username}</span>
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}

        {!checking && success && (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <div className="text-center">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

