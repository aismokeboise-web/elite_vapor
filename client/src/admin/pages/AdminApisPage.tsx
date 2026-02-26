import { useEffect, useState } from "react";
import { getAdminAuth } from "../auth";
import { fetchAdminApis, type AdminApiRoute } from "../../api/client";
import { AdminSkeleton } from "../components/AdminSkeleton";

export function AdminApisPage() {
  const auth = getAdminAuth();
  const [routes, setRoutes] = useState<AdminApiRoute[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      setLoading(false);
      setError("Not authenticated.");
      return;
    }

    let cancelled = false;

    fetchAdminApis(auth.token)
      .then((data) => {
        if (!cancelled) {
          setRoutes(data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load API routes.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  if (loading) {
    return <AdminSkeleton title="API routes" tableRows={12} />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">
        API routes
      </h1>
      <p className="mt-2 text-base text-slate-600">
        Public routes can be called without auth. Protected routes require{" "}
        <code className="font-mono text-indigo-600 rounded bg-indigo-50 px-1.5 py-0.5 text-sm">Authorization: Bearer &lt;token&gt;</code>.
      </p>
      {error && (
        <p className="mt-5 text-base text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-md">
        <table className="w-full border-collapse text-base">
          <thead className="bg-slate-100">
            <tr className="text-slate-600">
              <th className="px-5 py-4 text-left font-semibold">Method</th>
              <th className="px-5 py-4 text-left font-semibold">Path</th>
              <th className="px-5 py-4 text-left font-semibold">Description</th>
              <th className="px-5 py-4 text-left font-semibold">Access</th>
            </tr>
          </thead>
          <tbody>
            {(routes ?? []).map((route) => (
              <tr key={`${route.method}-${route.path}`} className="border-t border-slate-200">
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${
                      route.method === "GET"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : route.method === "POST"
                          ? "bg-sky-100 text-sky-800 border border-sky-200"
                          : route.method === "PATCH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {route.method}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-slate-700">{route.path}</td>
                <td className="px-5 py-3 text-slate-600">{route.description}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${
                      route.visibility === "public"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
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
    </div>
  );
}
