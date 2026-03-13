'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Modal } from "./Modal";
import { useAuthenticatedFetch } from "../lib/api";

function hasAnyPrivilege(can: (r: string, a: "create" | "update" | "delete" | "reply") => boolean, resource: string): boolean {
  return can(resource, "create") || can(resource, "update") || can(resource, "delete") || can(resource, "reply");
}

export function NavBar() {
  const { token, role, logout, hasLoggedInOnce, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const fetchWithAuth = useAuthenticatedFetch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);

  const isLoggedIn = Boolean(token && role);
  const canChangePassword = role === "subadmin" && hasLoggedInOnce === true;
  const showMessages = role === "admin" || hasAnyPrivilege(can, "message");
  const showNewsletter = role === "admin" || hasAnyPrivilege(can, "newsletter");

  useEffect(() => {
    if (!avatarOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [avatarOpen]);

  const links: { href: string; label: string }[] = [
    ...(role === "admin" ? [{ href: "/manage/moderators", label: "Moderators" }] : []),
    ...(isLoggedIn
      ? [
          { href: "/manage/categories", label: "Categories" },
          { href: "/manage/brands", label: "Brands" },
          { href: "/manage/products", label: "Products" },
          { href: "/manage/models", label: "Models" },
          ...(showMessages ? [{ href: "/manage/messages", label: "Messages" }] : []),
          ...(showNewsletter ? [{ href: "/manage/newsletter", label: "Newsletter" }] : []),
        ]
      : []),
    ...(!isLoggedIn ? [{ href: "/manage/login", label: "Login" }] : []),
  ];

  const isOnDashboard = pathname === "/manage";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push("/manage/login");
  };

  const openChangePasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePasswordError(null);
    setChangePasswordModalOpen(true);
    setMobileOpen(false);
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
      const res = await fetchWithAuth("/api/auth/subadmin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setChangePasswordError(data.error || "Failed to change password.");
        return;
      }
      setChangePasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setChangePasswordSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-indigo-200/80 bg-indigo-50/95 shadow-md shadow-indigo-900/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3 md:px-8 lg:px-10">
        <Link
          href="/manage"
          className={`flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3 transition-colors ${isOnDashboard ? "text-indigo-600 hover:text-indigo-700" : "text-slate-800 hover:text-indigo-600"}`}
        >
          <img
            src="/images/logo.svg"
            alt="Elite Vapor"
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />
          <span className="hidden truncate text-base font-bold tracking-wide sm:inline">
            Elite Vapor
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2 text-base font-medium sm:gap-3 md:gap-4">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? "font-semibold text-indigo-700"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isLoggedIn && (
            <div className="relative ml-2 border-l border-indigo-200 pl-3" ref={avatarRef}>
              <button
                type="button"
                onClick={() => setAvatarOpen((prev) => !prev)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-200 text-indigo-800 shadow-sm transition hover:bg-indigo-300 hover:text-indigo-900 sm:h-9 sm:w-9"
                aria-expanded={avatarOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[160px] rounded-xl border border-indigo-200/80 bg-white py-1 shadow-lg shadow-indigo-900/10">
                  <Link
                    href="/manage/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-900"
                  >
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-base text-red-600 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v3.75M15 15l-3-3m0 0l-3 3m3-3H8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800 transition cursor-pointer hover:bg-indigo-100"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-indigo-200/80 bg-indigo-50/95 sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <button
                  key={link.href + link.label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(link.href);
                  }}
                  className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-base font-medium transition ${
                    active
                      ? "font-semibold text-indigo-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            {isLoggedIn && (
              <>
                <Link
                  href="/manage/profile"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-lg px-3 py-2.5 text-left text-base text-slate-700 hover:bg-indigo-50"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-[0.8rem] font-medium text-red-700 cursor-pointer hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Modal
        open={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        title="Change password"
      >
        <p className="mb-4 text-sm text-slate-600">
          Enter your current password (the one shared by your admin) and choose a new password.
        </p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
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
              onClick={() => setChangePasswordModalOpen(false)}
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
    </header>
  );
}
