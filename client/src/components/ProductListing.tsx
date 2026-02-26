import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ListProduct } from "../store/useStore";
import { DEFAULT_PRODUCT_IMAGE_URLS, expandProductsForListing, useStore } from "../store/useStore";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

const DISPLAY_COUNT = 3;

const FEATURED_BADGE = { label: "Featured", className: "bg-amber-500/95 text-slate-900 font-semibold" };

export function ProductCard({ product, featuredSection = false }: { product: ListProduct; featuredSection?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = product.imageUrl ?? DEFAULT_PRODUCT_IMAGE_URLS[0];
  const showImage = imageUrl && !imgError;

  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-200/50 transition-all duration-200 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:ring-cyan-200/60">
      <Link
        to={`/products/${product.productId}${product.modelId ? `?model=${product.modelId}` : ""}`}
        className="relative flex h-[180px] items-center justify-center overflow-hidden bg-slate-100"
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl font-bold text-slate-300">
            {product.name.charAt(0)}
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
        {product.is_deal && product.deal_text && (
          <span
            className="absolute right-2 top-2 z-10 max-w-[7rem] truncate rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm sm:max-w-[9rem]"
            title={product.deal_text}
          >
            {product.deal_text}
          </span>
        )}
        {/* Featured section: show Featured badge (no Best seller); else Best seller, New, Clearance */}
        {(() => {
          const hasFeatured = featuredSection;
          const hasBestSeller = !featuredSection && product.is_best_seller;
          const hasNew = product.is_new;
          const hasClearance = product.is_clearance;
          const hasAny = hasFeatured || hasBestSeller || hasNew || hasClearance;
          if (!hasAny) return null;
          const badges = [
            hasFeatured ? FEATURED_BADGE : hasBestSeller ? { label: "Best seller", className: "bg-emerald-500/90 text-white" } : null,
            hasNew ? { label: "New", className: "bg-cyan-500/90 text-white" } : null,
            hasClearance ? { label: "Clearance", className: "bg-rose-500/90 text-white" } : null,
          ].filter(Boolean) as { label: string; className: string }[];
          const hasAllThree = badges.length === 3;
          const showRight = hasAllThree;
          return (
            <div className="absolute left-2 right-2 top-2 z-10 flex items-center justify-between gap-1">
              <span className="flex min-w-0 flex-1 justify-start">
                {badges[0] && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${badges[0].className}`}>
                    {badges[0].label}
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-1 justify-center">
                {badges[1] && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${badges[1].className}`}>
                    {badges[1].label}
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-1 justify-end">
                {showRight && badges[2] && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${badges[2].className}`}>
                    {badges[2].label}
                  </span>
                )}
              </span>
            </div>
          );
        })()}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product.productId}${product.modelId ? `?model=${product.modelId}` : ""}`} className="block">
          <h3 className="font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>
        <div className="mt-2 min-h-[1.25rem] space-y-0.5 text-xs text-slate-500">
          {product.flavors && product.flavors.length > 0 && (
            <p className="flex min-w-0 gap-1" title={product.flavors.join(", ")}>
              <span className="shrink-0">Flavors:</span>
              <span className="min-w-0 truncate">
                {product.flavors.length <= 2
                  ? product.flavors.join(", ")
                  : `${product.flavors.slice(0, 2).join(", ")}`}
              </span>
              {product.flavors.length > 2 && (
                <span className="shrink-0 font-medium text-slate-600">+{product.flavors.length - 2}</span>
              )}
            </p>
          )}
          {product.flavor && !(product.flavors && product.flavors.length > 0) && (
            <p className="truncate">Flavors: {product.flavor}</p>
          )}
          {product.nicotine_strength && (
            <p>Nicotine: {product.nicotine_strength}</p>
          )}
        </div>
        <div className="mt-auto flex flex-col pt-4">
		<p>
		<span className="text-sm line-through decoration-red-500 decoration-2">
		<>${((product.price)*1.5).toFixed(2)}</>
		</span>
		 <span className="text-md font-bold text-slate-900">
            <>&emsp;${product.price.toFixed(2)}</>
          </span>
   
		</p>
           <Link
            to={`/products/${product.productId}${product.modelId ? `?model=${product.modelId}` : ""}`}
            className="mt-3 inline-flex w-fit items-center justify-center gap-2 self-center rounded-xl border-2 border-cyan-500 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-700 transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          >
            View product
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductListing() {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const activeProducts = useMemo(() => {
    const expanded = expandProductsForListing(products);
    const bestSellers = expanded.filter((p) => p.is_best_seller);
    if (bestSellers.length === 0) {
      return expanded.slice(0, DISPLAY_COUNT);
    }
    const shuffled = [...bestSellers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, DISPLAY_COUNT);
  }, [products]);

  if (loading) {
    return (
      <section
        className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        aria-busy="true"
        aria-label="Loading products"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(8,47,73,0.8),transparent_60%)] opacity-90"
          aria-hidden
        />
        <div className="overflow-hidden rounded-2xl border-2 border-cyan-200/90 bg-gradient-to-br from-white/95 via-cyan-50/60 to-slate-50/95 py-10 shadow-md shadow-cyan-900/20 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-cyan-200" aria-hidden />
              <div className="mx-auto mt-3 h-9 w-64 animate-pulse rounded bg-cyan-100/80" />
              <div className="mx-auto mt-2 h-5 w-80 animate-pulse rounded bg-slate-200/80" />
              <div className="mx-auto mt-3 flex justify-center gap-1">
                <span className="h-1 w-8 rounded-full bg-cyan-300/70" />
                <span className="h-1 w-3 rounded-full bg-cyan-300/50" />
                <span className="h-1 w-2 rounded-full bg-cyan-300/40" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <div className="h-12 w-36 animate-pulse rounded-lg bg-slate-300" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-5 text-sm text-rose-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              !
            </div>
            <div>
              <p className="font-semibold">We couldn&apos;t load products right now.</p>
              <p className="mt-1 text-rose-900/90">
                Please check your internet connection and try again in a moment.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-labelledby="featured-products-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(8,47,73,0.8),transparent_60%)] opacity-90"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border-2 border-cyan-200/90 bg-gradient-to-br from-white/95 via-cyan-50/60 to-slate-50/95 py-10 shadow-md shadow-cyan-900/20 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-14 w-max items-center justify-center gap-1 rounded-full bg-cyan-100 px-4 text-cyan-600" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <h2 id="featured-products-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Featured products
            </h2>
            <p className="mt-2 text-sm font-medium italic text-cyan-700/90 sm:text-base">
              Hand-picked favorites for your next session
            </p>
            <div className="mx-auto mt-3 flex justify-center gap-1" aria-hidden>
              <span className="h-1 w-8 rounded-full bg-cyan-500" />
              <span className="h-1 w-3 rounded-full bg-cyan-400/70" />
              <span className="h-1 w-2 rounded-full bg-cyan-400/50" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeProducts.length === 0 ? (
              <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                No products yet. Add products and models via the admin panel.
              </p>
            ) : (
              activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} featuredSection />
              ))
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
