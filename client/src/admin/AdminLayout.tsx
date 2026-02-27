import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink, Navigate } from "react-router-dom";
import { clearAdminAuth, getAdminAuth } from "./auth";

const NAV_ITEMS = [
  { to: "products", label: "Products" },
  { to: "models", label: "Models" },
  { to: "categories", label: "Categories" },
  { to: "brands", label: "Brands" },
  { to: "newsletter-subscriptions", label: "Newsletter Subscriptions" },
  { to: "messages", label: "Messages" },
] as const;

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MenuHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const auth = getAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on desktop/laptop, keep it closed on tablet/mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  if (!auth) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    clearAdminAuth();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-200 text-slate-800 font-admin antialiased lg:flex">
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-5 z-30 flex h-12 w-12 items-center justify-center rounded-r-xl border border-slate-300 border-l-0 bg-slate-100 text-slate-600 shadow-xl hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-200"
          aria-label="Show navigation"
        >
          <MenuHorizontalIcon />
        </button>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-slate-300 bg-slate-100 shadow-lg transition-transform duration-200 lg:static lg:z-auto lg:shrink-0 lg:border-r lg:bg-slate-100 lg:shadow-lg lg:transform-none lg:transition-[width] ${
          sidebarOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:w-0 lg:overflow-hidden"
        }`}
      >
        <div className="sticky top-0 flex w-64 flex-col lg:min-h-screen">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-600 bg-slate-800 text-white">
            <h1 className="text-sm font-semibold tracking-tight md:text-base">
              Admin
            </h1>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              aria-label="Hide navigation"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-2 py-2 sm:py-3 flex flex-col gap-0.5 bg-slate-100 lg:flex-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={`/admin/${to}`}
                className={({ isActive }) =>
                  `rounded-r-lg border-l-4 py-3 px-4 text-sm font-medium md:text-base ${
                    isActive
                      ? "border-indigo-600 bg-indigo-100 text-indigo-800"
                      : "border-transparent text-slate-600 hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-2 sm:p-3 border-t border-slate-300 bg-slate-200">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
      <main
        id="admin-main"
        className={`flex-1 min-h-0 px-6 sm:px-8 py-8 bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300 text-base flex flex-col ${
          sidebarOpen ? "overflow-hidden" : "overflow-auto"
        } lg:overflow-auto`}
      >
        <div className="rounded-2xl border border-slate-300 bg-white px-6 py-6 shadow-lg sm:px-8 sm:py-8">
          <Outlet />
        </div>
        <footer className="mt-auto shrink-0 pt-6 text-center text-sm text-slate-600">
          © 2026 Empire Vapor. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
