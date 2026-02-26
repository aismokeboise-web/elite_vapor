import { Link } from "react-router-dom";

export function AdminNotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-12 shadow-sm">
        <p className="text-7xl font-bold tracking-tight text-slate-300">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-800">
          Page not found
        </h1>
        <p className="mt-2 text-base text-slate-600">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          to="/admin/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to Products
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
