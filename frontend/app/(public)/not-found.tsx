import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:max-w-2xl sm:px-10 sm:py-12 lg:max-w-3xl lg:px-12 lg:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          404 – Page not found
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          The link might be broken or the page may have been moved. You can head back home or browse our
          products.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:border-slate-800"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}

