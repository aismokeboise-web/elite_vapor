import { useState } from "react";
import { Link } from "react-router-dom";
import { getFriendlyErrorMessage, requestAdminPasswordReset } from "../api/client";

export function AdminForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Please enter your username or email.");
      return;
    }

    try {
      setSubmitting(true);
      await requestAdminPasswordReset({ identifier: trimmed });
      setSent(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg shadow-slate-200/50">
        <h1 className="text-xl font-semibold text-slate-800 text-center">
          Reset admin password
        </h1>
        <p className="mt-1 text-sm text-slate-500 text-center">
          Enter your admin username or email and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {sent && !error && (
            <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              If an account exists for that identifier, a reset link has been sent.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="Username or Email"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
          >
            {submitting ? "Sending link…" : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/admin"
            className="text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

