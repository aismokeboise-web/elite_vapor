'use client';

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, type UserRole } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";

type RoleOption = UserRole;

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

function LoginPageInner() {
  const { login, token, role, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginRole, setLoginRole] = useState<RoleOption>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (token && role) {
      const next = searchParams.get("next") || "/manage";
      if (role === "subadmin" && next.startsWith("/manage/moderators")) {
        router.replace("/manage");
        return;
      }
      router.replace(next);
    }
  }, [token, role, loading, router, searchParams]);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const base = getBackendUrl();
      const endpoint =
        loginRole === "admin" ? "/api/admin/login" : "/api/subadmin/login";

      const res = await fetch(`${base}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error || "Login failed. Please check your credentials.");
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as {
        token: string;
        privileges?: Array<{ resource: string; canCreate: boolean; canUpdate: boolean; canDelete: boolean }>;
        hasLoggedInOnce?: boolean;
      };
      if (!data.token) {
        setError("Login succeeded but no token was returned.");
        setSubmitting(false);
        return;
      }

      login({
        token: data.token,
        role: loginRole,
        privileges: loginRole === "subadmin" ? (data.privileges ?? []) : null,
        hasLoggedInOnce: loginRole === "subadmin" ? (data.hasLoggedInOnce ?? false) : null,
      });

      const next = searchParams.get("next") || "/manage";
      if (loginRole === "subadmin" && next.startsWith("/manage/moderators")) {
        router.push("/manage");
        return;
      }
      router.push(next);
    } catch (err) {
      console.error(err);
      setError("Network error while logging in. Please try again.");
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    setForgotSubmitting(true);

    try {
      const base = getBackendUrl();
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail || username }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setForgotError(
          data?.error || "Could not start password reset. Please try again later."
        );
        setForgotSubmitting(false);
        return;
      }

      setForgotMessage(
        "If an account exists for that email, we’ve sent a password reset link."
      );
      setForgotSubmitting(false);
    } catch (err) {
      console.error(err);
      setForgotError("Network error while requesting password reset. Please try again.");
      setForgotSubmitting(false);
    }
  };

  const isRedirecting = ((token && role) || loading) && !error;

  return (
    <>
      <div className={`flex w-full flex-1 flex-col items-center justify-center ${isRedirecting ? "min-h-0 py-3 pl-4 pr-2 pb-1" : "min-h-[calc(100vh-8rem)] px-2"}`}>
        <div className={`w-full animate-[fadeIn_0.4s_ease-out] ${isRedirecting ? "max-w-xl" : "max-w-md"}`}>
          <div className={`admin-card overflow-hidden shadow-lg shadow-indigo-900/10 ${isRedirecting ? "min-h-[10rem] p-6 sm:p-8" : "p-5 sm:p-8"}`}>
            {isRedirecting ? (
              <div className="flex min-h-[8rem] flex-col items-center justify-center py-6">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
                <p className="mt-4 text-base text-slate-500">Redirecting…</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Sign in to Elite Vapor
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-600">
                      Login as
                    </span>
                    <div
                      className="inline-flex w-full rounded-xl border border-indigo-200/80 bg-slate-50/80 p-1.5"
                      aria-label="Choose role"
                    >
                      <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          loginRole === "admin"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                        onClick={() => setLoginRole("admin")}
                      >
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        <span className="hidden sm:inline">Admin</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          loginRole === "subadmin"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                        onClick={() => setLoginRole("subadmin")}
                      >
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span className="hidden sm:inline">Moderator</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="username">
                      Username or email
                    </label>
                    <input
                      id="username"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                      placeholder="Enter your username or email"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition cursor-pointer hover:bg-indigo-500 disabled:opacity-60"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Signing in…" : "Sign in"}
                  </button>
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-700 underline-offset-2 hover:underline"
                      onClick={() => {
                        setForgotOpen(true);
                        setForgotEmail(username || "");
                        setForgotError(null);
                        setForgotMessage(null);
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setForgotSubmitting(false);
        }}
        title="Reset password"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter the email for your admin or moderator account. If it matches an account, we&apos;ll email you a password reset link.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
          </div>
          {forgotError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {forgotError}
            </div>
          )}
          {forgotMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {forgotMessage}
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200"
              onClick={() => {
                setForgotOpen(false);
                setForgotSubmitting(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={forgotSubmitting}
              className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {forgotSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
