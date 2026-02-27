import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, loginAdmin, getFriendlyErrorMessage } from "../api/client";
import { getAdminAuth, setAdminAuth } from "./auth";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const existing = getAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    // Already authenticated, go straight to dashboard
    navigate("/admin/dashboard", { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const trimmedIdentifier = username.trim();

    if (!trimmedIdentifier || !password) {
      setError("Please enter username or email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await loginAdmin({
        username: trimmedIdentifier,
        password,
      });
      if (!("success" in result) || !result.success || !result.token || !result.expiresAt) {
        setError("Login failed. Please check your credentials and try again.");
        setSubmitting(false);
        return;
      }

      setAdminAuth({ token: result.token, expiresAt: result.expiresAt });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid username/email or password.");
      } else {
        setError(getFriendlyErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg shadow-slate-200/50">
        <h1 className="text-xl font-semibold text-slate-800 text-center">
          Admin login
        </h1>
        <p className="mt-1 text-sm text-slate-500 text-center">
          Sign in to access the admin dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Username or Email"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-2 text-right">
              <Link
                to="/admin/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

