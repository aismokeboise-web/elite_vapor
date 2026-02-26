import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "./ProductListing";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { expandProductsForListing, useStore } from "../store/useStore";

const DISPLAY_COUNT = 6;

export function NewArrivalsListing() {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const newArrivals = useMemo(
    () =>
      expandProductsForListing(products)
        .filter((p) => p.is_new === true)
        .slice(0, DISPLAY_COUNT),
    [products]
  );

  if (newArrivals.length === 0 && !loading) return null;

  return (
    <section
      className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-labelledby="new-arrivals-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.09),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.75),transparent_60%)] opacity-90"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-white/95 via-emerald-50/55 to-slate-50/95 py-10 shadow-md shadow-emerald-900/15 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" aria-hidden>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h2 id="new-arrivals-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              New arrivals
            </h2>
            <p className="mt-2 text-sm font-medium italic text-emerald-700/90 sm:text-base">
              Just in — fresh picks for your next order
            </p>
            <div className="mx-auto mt-3 flex justify-center gap-1" aria-hidden>
              <span className="h-1 w-8 rounded-full bg-emerald-500" />
              <span className="h-1 w-3 rounded-full bg-emerald-400/70" />
              <span className="h-1 w-2 rounded-full bg-emerald-400/50" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/products/new"
              className="inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              View new products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
