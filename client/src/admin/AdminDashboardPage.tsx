import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminAuth, getAdminAuth } from "./auth";

type ApiRoute = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  visibility: "public" | "protected";
};

const API_ROUTES: ApiRoute[] = [
  // Products
  { method: "GET", path: "/api/products", description: "List all products with models", visibility: "public" },
  { method: "GET", path: "/api/products/:id", description: "Get a single product with models", visibility: "public" },
  { method: "POST", path: "/api/products", description: "Create a product", visibility: "protected" },
  { method: "PATCH", path: "/api/products/:id", description: "Update a product", visibility: "protected" },
  { method: "DELETE", path: "/api/products/:id", description: "Delete a product", visibility: "protected" },
  { method: "POST", path: "/api/products/upload", description: "Create a product with image upload", visibility: "protected" },
  // Brands
  { method: "GET", path: "/api/brands", description: "List brands", visibility: "public" },
  { method: "POST", path: "/api/brands", description: "Create brand", visibility: "protected" },
  { method: "PATCH", path: "/api/brands/:id", description: "Update brand", visibility: "protected" },
  { method: "DELETE", path: "/api/brands/:id", description: "Delete brand", visibility: "protected" },
  // Categories
  { method: "GET", path: "/api/categories", description: "List categories", visibility: "public" },
  { method: "GET", path: "/api/categories/:id", description: "Get a single category", visibility: "public" },
  { method: "POST", path: "/api/categories", description: "Create category", visibility: "protected" },
  { method: "PATCH", path: "/api/categories/:id", description: "Update category", visibility: "protected" },
  { method: "DELETE", path: "/api/categories/:id", description: "Delete category", visibility: "protected" },
  // Models
  { method: "GET", path: "/api/models", description: "List models", visibility: "public" },
  { method: "GET", path: "/api/models/:id", description: "Get a single model", visibility: "public" },
  { method: "POST", path: "/api/models", description: "Create model", visibility: "protected" },
  { method: "PATCH", path: "/api/models/:id", description: "Update model", visibility: "protected" },
  { method: "DELETE", path: "/api/models/:id", description: "Delete model", visibility: "protected" },
  // Contact & newsletter (public write)
  { method: "POST", path: "/api/contact", description: "Submit contact message", visibility: "public" },
  { method: "POST", path: "/api/newsletter-subscriptions", description: "Subscribe email to newsletter", visibility: "public" },
  // Admin auth
  { method: "POST", path: "/api/admin/login", description: "Admin login (returns 2-hour token)", visibility: "public" },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const auth = getAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!auth) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleLogout = () => {
    clearAdminAuth();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-cyan-300">
              Admin dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Quick overview of your store admin tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:bg-slate-800"
            >
              APIs
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-600 bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:border-rose-500 hover:bg-rose-950/60 hover:text-rose-100"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              API & data
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Use the server&apos;s <code className="font-mono text-[11px] text-cyan-300">/admin</code> and{" "}
              <code className="font-mono text-[11px] text-cyan-300">/api</code> endpoints to manage brands, categories,
              products, models, messages, and newsletter subscriptions.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Next steps
            </h2>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-400">
              <li>Use the backend HTML admin at <code className="font-mono text-[11px] text-cyan-300">/admin</code> to manage data.</li>
              <li>Extend this React admin to call protected JSON APIs as needed.</li>
            </ul>
          </section>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl shadow-black/60 px-4 py-5 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                API routes
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Close API drawer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-3 text-[11px] text-slate-400">
              Public routes can be called without auth. Protected routes require an admin token in{" "}
              <code className="font-mono text-[11px] text-cyan-300">Authorization: Bearer &lt;token&gt;</code>.
            </p>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 bg-slate-950">
                  <tr className="text-slate-400">
                    <th className="py-1 pr-2 text-left font-medium">Method</th>
                    <th className="py-1 pr-2 text-left font-medium">Path</th>
                    <th className="py-1 text-left font-medium">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ROUTES.map((route) => (
                    <tr key={`${route.method}-${route.path}`} className="border-t border-slate-800/60">
                      <td className="py-1 pr-2 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            route.method === "GET"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : route.method === "POST"
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                                : route.method === "PATCH"
                                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/40"
                                  : "bg-rose-500/15 text-rose-200 border border-rose-500/40"
                          }`}
                        >
                          {route.method}
                        </span>
                      </td>
                      <td className="py-1 pr-2 align-top">
                        <code className="font-mono text-[11px] text-slate-100">{route.path}</code>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {route.description}
                        </div>
                      </td>
                      <td className="py-1 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            route.visibility === "public"
                              ? "bg-slate-800 text-slate-200 border border-slate-600"
                              : "bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-500/40"
                          }`}
                        >
                          {route.visibility === "public" ? "Public" : "Protected"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

