"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ProductCard } from "@/components/ProductCard";
import { CardGridSkeleton } from "@/components/Skeleton";

// requestIdleCallback is not in lib.dom.d.ts for older TS versions
declare global {
  interface Window {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
  }
}

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

const BANNER_IMAGE = process.env.NEXT_PUBLIC_BANNER_IMAGE || "/images/banner.png";

type Category = { id: string; name: string; slug?: string | null; iconPath?: string | null };
type Product = {
  id: string;
  name: string;
  brand: { id: string; name: string; category: { id: string; name: string } };
  models: { id: string; name: string; price: string; imageUrls: string[] }[];
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function fillToThree(selected: Product[], pool: Product[]): Product[] {
  const ids = new Set(selected.map((p) => p.id));
  const rest = pool.filter((p) => !ids.has(p.id));
  const added = shuffle(rest).slice(0, Math.max(0, 3 - selected.length));
  return [...selected, ...added].slice(0, 3);
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [clearance, setClearance] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // Phase 1: critical above-fold data — categories + all products grid
  useEffect(() => {
    if (!BACKEND) return;
    Promise.all([
      fetch(`${BACKEND}/api/categories`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${BACKEND}/api/products`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cat, all]) => {
        setCategories(Array.isArray(cat) ? cat.slice(0, 6) : []);
        setAllProducts(Array.isArray(all) ? all : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Phase 2: below-fold sections — deferred so they don't block initial paint
  useEffect(() => {
    if (!BACKEND) return;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => loadBelowFold(), { timeout: 2000 })
      : window.setTimeout(() => loadBelowFold(), 800);

    function loadBelowFold() {
      Promise.all([
        fetch(`${BACKEND}/api/products?is_featured=1`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${BACKEND}/api/products?is_new=1`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${BACKEND}/api/products?is_deal=1`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${BACKEND}/api/products?is_clearance=1`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${BACKEND}/api/products?is_best_seller=1`).then((r) => (r.ok ? r.json() : [])),
      ])
        .then(([feat, newP, dealP, clearP, best]) => {
          setFeatured(Array.isArray(feat) ? feat : []);
          setNewArrivals(Array.isArray(newP) ? newP : []);
          setDeals(Array.isArray(dealP) ? dealP : []);
          setClearance(Array.isArray(clearP) ? clearP : []);
          setBestSellers(Array.isArray(best) ? best : []);
        })
        .catch(() => {});
    }

    return () => {
      if (window.requestIdleCallback) {
        window.cancelIdleCallback(id as number);
      } else {
        window.clearTimeout(id as number);
      }
    };
  }, []);

  const allRandom6 = useMemo(
    () => shuffle(allProducts).slice(0, 6),
    [allProducts]
  );
  const featured3 = useMemo(
    () => fillToThree(featured, allProducts),
    [featured, allProducts]
  );
  const newArrivals3 = useMemo(
    () => fillToThree(newArrivals, allProducts),
    [newArrivals, allProducts]
  );
  const deals3 = useMemo(
    () => fillToThree(deals, allProducts),
    [deals, allProducts]
  );
  const clearance3 = useMemo(
    () => fillToThree(clearance, allProducts),
    [clearance, allProducts]
  );
  const bestSellers3 = useMemo(
    () => fillToThree(bestSellers, allProducts),
    [bestSellers, allProducts]
  );

  return (
    <div className="flex flex-col">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      {/* The section is position:relative so Next.js <Image fill> works correctly */}
      <section className="relative min-h-[480px] w-full overflow-hidden bg-slate-900 md:min-h-[580px]">

        {/* Animated gradient — always visible instantly (CSS only, no JS needed) */}
        <div className="public-banner-animated absolute inset-0 z-0" aria-hidden />
        <div className="public-banner-shine absolute inset-0 z-0" aria-hidden />

        {/* Banner image — Next.js Image automatically serves WebP/AVIF.
            priority=true injects a <link rel="preload"> in <head>.
            No opacity fade so the image counts for LCP immediately. */}
        <Image
          src={BANNER_IMAGE}
          alt=""
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
          style={{ zIndex: 0 }}
        />

        {/* Gradient overlay for text legibility */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-800/20"
          aria-hidden
        />

        {/* Content — z-10 sits above overlay */}
        <div className="relative z-10 mx-auto flex min-h-[480px] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 md:min-h-[580px] md:pb-28 md:pt-40 lg:px-8">

          {/* Badge — subtle entrance, not LCP-critical so animation is fine */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Boise, Idaho
          </motion.div>

          {/* H1 — LCP candidate. Rendered immediately (opacity:1, no JS delay).
              Only the y-position animates so paint happens on first frame. */}
          <h1 className="banner-heading text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.7)] sm:text-5xl md:text-6xl lg:text-7xl">
            Elite Vapor Vape and Smoke
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="mt-4 max-w-2xl text-base font-medium text-slate-200 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] sm:text-lg md:text-xl"
          >
            Your trusted vape shop and smoke shop in Boise, ID for premium vapes, e-liquids, and accessories.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-bold text-slate-900 shadow-xl transition hover:bg-slate-100 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Browse all products
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H7" />
              </svg>
            </Link>
            <Link
              href="/products/best-sellers"
              className="inline-flex items-center rounded-full border border-white/50 bg-white/10 px-7 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Best sellers
            </Link>
          </motion.div>
        </div>
      </section>

      {/* All products – 6 random, below hero */}
      {(loading || allRandom6.length > 0) && (
        <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">All products</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Discover our full range of vaping products.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products"
                    className="inline-flex items-center rounded-full border border-indigo-700 bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 hover:border-indigo-600"
                  >
                    Browse catalogue
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {allRandom6.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all products
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured – 3 products */}
      {(loading || featured3.length > 0) && (
        <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-100 via-white to-indigo-100 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L9.5 9.5L3 12L9.5 14.5L12 21L14.5 14.5L21 12L14.5 9.5L12 3Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured products</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Curated picks we think you will love.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products/featured"
                    className="inline-flex items-center rounded-full border border-violet-700 bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 hover:border-violet-600"
                  >
                    View all featured
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featured3.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products/featured"
                  className="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-800"
                >
                  View all featured
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals – 3 products */}
      {(loading || newArrivals3.length > 0) && (
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H12M19 12H12M12 12V5M12 12V19"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">New arrivals</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Fresh drops that just landed in store.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products/new"
                    className="inline-flex items-center rounded-full border border-sky-700 bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 hover:border-sky-600"
                  >
                    View all new arrivals
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {newArrivals3.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products/new"
                  className="inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  View all new arrivals
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals – 3 products */}
      {(loading || deals3.length > 0) && (
        <section className="border-b border-slate-200 bg-fuchsia-50/70 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-fuchsia-200/80 bg-gradient-to-br from-fuchsia-100 via-white to-fuchsia-200 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 12L12 4L20 12L12 20L4 12Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.5 9.5H9.51M14.5 14.5H14.51"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Deals</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Limited time discounts across popular products.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products/deals"
                    className="inline-flex items-center rounded-full border border-fuchsia-700 bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-fuchsia-500 hover:border-fuchsia-600"
                  >
                    Shop all deals
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {deals3.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products/deals"
                  className="inline-flex items-center text-sm font-medium text-fuchsia-700 hover:text-fuchsia-800"
                >
                  Shop all deals
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Clearance – 3 products */}
      {(loading || clearance3.length > 0) && (
        <section className="border-b border-slate-200 bg-amber-50/70 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-100 via-white to-rose-100 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 20C7 20 4 17 4 13C4 9 7 6 12 4C12 4 11 6.5 11 9C11 11.5 12.5 13 14 14C15.5 15 17 16.5 17 19"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 20H18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Clearance</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Last chance items at the best prices.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products/clearance"
                    className="inline-flex items-center rounded-full border border-amber-700 bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500 hover:border-amber-600"
                  >
                    View all clearance
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {clearance3.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products/clearance"
                  className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
                >
                  View all clearance
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers – 3 products */}
      {(loading || bestSellers3.length > 0) && (
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-indigo-100 via-white to-slate-100 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L14.09 8.26L19.8 8.63L15.5 12.14L16.9 17.77L12 14.75L7.1 17.77L8.5 12.14L4.2 8.63L9.91 8.26L12 3Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Best sellers</h2>
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                      Customer favourites that people come back for.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Link
                    href="/products/best-sellers"
                    className="inline-flex items-center rounded-full border border-emerald-700 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 hover:border-emerald-600"
                  >
                    View all best sellers
                  </Link>
                </div>
              </div>
              <div className="mt-8">
                {loading ? (
                  <CardGridSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {bestSellers3.map((p, i) => (
                      <ProductCard key={p.id} product={p} delay={i} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/products/best-sellers"
                  className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-700"
                >
                  See all best sellers
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals & Clearance CTA */}
      <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/products/deals"
              className="group flex flex-col rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 p-8 transition hover:border-rose-300 hover:brightness-105"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-rose-600">Limited time</span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Deals</h3>
              <p className="mt-2 text-slate-600">Exclusive offers on selected products.</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-rose-700 underline-offset-2 hover:underline group-hover:underline">
                Shop deals{" "}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/products/clearance"
              className="group flex flex-col rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-100 via-amber-50 to-rose-50 p-8 transition hover:border-amber-300 hover:brightness-105"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-amber-700">Clearance</span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Clearance</h3>
              <p className="mt-2 text-slate-600">Great products at reduced prices.</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-amber-800 underline-offset-2 hover:underline group-hover:underline">
                View clearance{" "}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter subscription */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-emerald-50 via-slate-50 to-sky-50 py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 px-6 py-8 text-center shadow-sm backdrop-blur-sm sm:px-8 sm:py-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Stay in the loop
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
              Get updates on new arrivals, limited-time deals, and clearance drops from Elite Vapor—straight to your
              inbox.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
              onSubmit={async (e) => {
                e.preventDefault();
                const email = newsletterEmail.trim().toLowerCase();
                if (!email) return;
                setNewsletterLoading(true);
                setNewsletterError(null);
                setNewsletterSuccess(null);
                try {
                  const res = await fetch(`${BACKEND}/api/newsletter`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok) {
                    setNewsletterSuccess("You're subscribed! Check your inbox for a confirmation.");
                    setNewsletterEmail("");
                  } else if (res.status === 409) {
                    setNewsletterError("This email is already subscribed.");
                  } else {
                    setNewsletterError((data as { error?: string }).error || "Something went wrong. Please try again.");
                  }
                } catch {
                  setNewsletterError("Something went wrong. Please try again.");
                } finally {
                  setNewsletterLoading(false);
                }
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                className="w-full max-w-xs rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="cursor-pointer inline-flex items-center justify-center rounded-full bg-sky-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-200/80 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {newsletterLoading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
            {newsletterSuccess && (
              <p className="mt-3 text-sm text-emerald-600 font-medium">
                {newsletterSuccess}
              </p>
            )}
            {newsletterError && (
              <p className="mt-3 text-sm text-red-600 font-medium">
                {newsletterError}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
