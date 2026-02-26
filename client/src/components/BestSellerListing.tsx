import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "./ProductListing";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { expandProductsForListing, useStore } from "../store/useStore";

const DISPLAY_COUNT = 6;

export function BestSellerListing() {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const bestSellers = useMemo(
    () =>
      expandProductsForListing(products)
        .filter((p) => p.is_best_seller)
        .slice(0, DISPLAY_COUNT),
    [products]
  );

  return (
    <section
      className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-labelledby="best-sellers-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(120,53,15,0.9),transparent_60%)] opacity-90"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-white/95 via-amber-50/55 to-slate-50/95 py-10 shadow-md shadow-amber-900/15 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600" aria-hidden>
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path fillRule="evenodd" d="M5.166 2.239l.861 3.35c.071.276.323.47.61.47h6.746c.287 0 .539-.194.61-.47l.861-3.35a.75.75 0 00-.861-.988l-2.81.468a.75.75 0 01-.61-.47L11.5 1.5 9.89 2.23a.75.75 0 01-.61.47l-2.81-.468a.75.75 0 00-.861.988zM3.415 8.53a.75.75 0 01.554.615l.92 3.925a.75.75 0 01-.364.978A2.25 2.25 0 004.896 15h14.208a2.25 2.25 0 001.331-3.953.75.75 0 01-.364-.978l.92-3.925a.75.75 0 011.07-.67l2.81.469a.75.75 0 01.554.615l.92 3.925a.75.75 0 01-.364.978 2.25 2.25 0 01-1.331.353H3.896a2.25 2.25 0 01-1.331-.353.75.75 0 01-.364-.978l.92-3.925a.75.75 0 01.554-.615l2.81-.469z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 id="best-sellers-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Best sellers
            </h2>
            <p className="mt-2 text-sm font-medium italic text-amber-700/90 sm:text-base">
              Top picks loved by our community
            </p>
            <div className="mx-auto mt-3 flex justify-center gap-1" aria-hidden>
              <span className="h-1 w-8 rounded-full bg-amber-500" />
              <span className="h-1 w-3 rounded-full bg-amber-400/70" />
              <span className="h-1 w-2 rounded-full bg-amber-400/50" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/best-sellers"
              className="inline-flex items-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              View best products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
