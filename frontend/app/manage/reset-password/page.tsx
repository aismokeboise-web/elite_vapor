'use client';

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = searchParams.get("token") || "";
  const role = searchParams.get("role") || "";

  useEffect(() => {
    if (!token) {
      setError("This password reset link is invalid or missing a token.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("This password reset link is invalid or missing a token.");
      return;
    }

    if (password !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const base = getBackendUrl();
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | { ok?: boolean } | null;

      if (!res.ok || !data || (data as any).error) {
        setError(
          (data as any)?.error ||
            "Could not reset password. The link may be invalid or expired."
        );
        setSubmitting(false);
        return;
      }

      setSuccess("Your password has been reset. You can now sign in with your new password.");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setError("Network error while resetting password. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-1 flex-col items-center justify-center px-2">
      <div className="w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
        <div className="admin-card overflow-hidden p-5 shadow-lg shadow-indigo-900/10 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Reset your password
            </h1>
            {role && (
              <p className="mt-1 text-xs text-slate-500">
                You are resetting a {role === "admin" ? "admin" : "moderator"} account password.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                placeholder="Enter a strong new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                placeholder="Re-enter your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <button
              className="mt-1 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition cursor-pointer hover:bg-indigo-500 disabled:opacity-60"
              type="submit"
              disabled={submitting || !token}
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => router.push("/manage/login")}
            >
              Back to sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

