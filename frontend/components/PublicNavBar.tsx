"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

type Category = { id: string; name: string; iconPath?: string | null };

let cachedCategories: Category[] | null = null;
let categoriesPromise: Promise<Category[]> | null = null;

function fetchCategoriesEarly(): Promise<Category[]> {
  if (!BACKEND) return Promise.resolve([]);
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (!categoriesPromise) {
    categoriesPromise = fetch(`${BACKEND}/api/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        cachedCategories = Array.isArray(data) ? data : [];
        return cachedCategories;
      })
      .catch(() => {
        cachedCategories = [];
        return [];
      });
  }
  return categoriesPromise;
}

// Start fetching categories as soon as this module loads on the client
if (typeof window !== "undefined") {
  void fetchCategoriesEarly();
}

export function PublicNavBar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!BACKEND) return;
    fetchCategoriesEarly()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const isProductsPage = pathname === "/products" || pathname?.startsWith("/category/");
  const isShopPage = pathname === "/shop" || pathname?.startsWith("/products/");
  const isHome = pathname === "/";
  const activeNav =
    "bg-indigo-200/90 text-slate-900 shadow-sm";
  const navLink =
    "group rounded-full border border-transparent px-3 py-2 text-[15px] md:text-[16px] font-medium transition-colors cursor-pointer";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-md backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm md:text-base font-semibold tracking-tight ${
            isHome
              ? "bg-indigo-200 text-slate-900 shadow-md"
              : "text-slate-100 hover:bg-slate-800/80 hover:text-indigo-100"
          } transition-colors`}
        >
          <img
            src="/images/logo.svg"
            alt="Elite Vapor"
            className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
          />
          <span className="tracking-tight">Elite Vapor</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:gap-2 md:flex">
          {/* All Categories: link to /products, dropdown on hover */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <Link
              href="/products"
              className={`${navLink} flex items-center gap-1.5 ${
                isProductsPage
                  ? activeNav
                  : "text-slate-100 hover:bg-slate-700/80 hover:border-slate-500 hover:text-indigo-100"
              }`}
            >
              All Categories
              <svg
                className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            {categoriesOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full z-50 min-w-[220px] pt-1">
                <div className="rounded-xl border border-slate-700 bg-slate-900 py-1.5 shadow-lg">
                  {categories.map((c) => {
                    const iconUrl = c.iconPath ? `${BACKEND}${c.iconPath}` : null;
                    return (
                      <Link
                        key={c.id}
                        href={`/category/${c.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base text-slate-100 transition hover:bg-slate-800"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-full bg-slate-100 p-1 object-contain"
                          />
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-900">
                            {c.name.charAt(0)}
                          </span>
                        )}
                        <span className="font-medium">{c.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Shop: link to /shop page, dropdown on hover */}
          <div
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link
              href="/shop"
              className={`${navLink} flex items-center gap-1.5 ${
                isShopPage
                  ? activeNav
                  : "text-slate-100 hover:bg-slate-700/80 hover:border-slate-500 hover:text-indigo-100"
              }`}
            >
              Shop
              <svg
                className={`h-4 w-4 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            {shopOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[220px] pt-1">
                <div className="rounded-xl border border-slate-700 bg-slate-900 py-1.5 shadow-lg">
                  <Link
                    href="/products/clearance"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base font-medium text-slate-100 transition hover:bg-slate-800"
                    onClick={() => setShopOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="19" y1="5" x2="5" y2="19" />
                      <circle cx="6.5" cy="6.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                    Clearance
                  </Link>
                  <Link
                    href="/products/featured"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base font-medium text-slate-100 transition hover:bg-slate-800"
                    onClick={() => setShopOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Featured
                  </Link>
                  <Link
                    href="/products/deals"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base font-medium text-slate-100 transition hover:bg-slate-800"
                    onClick={() => setShopOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Deals
                  </Link>
                  <Link
                    href="/products/best-sellers"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base font-medium text-slate-100 transition hover:bg-slate-800"
                    onClick={() => setShopOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    Best Sellers
                  </Link>
                  <Link
                    href="/products/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm md:text-base font-medium text-slate-100 transition hover:bg-slate-800"
                    onClick={() => setShopOpen(false)}
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
                    </svg>
                    New Arrivals
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className={`${navLink} ${
              pathname === "/about"
                ? activeNav
                : "text-slate-100 hover:bg-slate-700/80 hover:border-slate-500 hover:text-indigo-100"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`${navLink} ${
              pathname === "/contact"
                ? activeNav
                : "text-slate-100 hover:bg-slate-700/80 hover:border-slate-500 hover:text-indigo-100"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-100 shadow-sm transition hover:bg-slate-800 hover:text-indigo-100 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => {
            setMobileOpen((prev) => !prev);
            setCategoriesOpen(false);
            setShopOpen(false);
          }}
        >
          <svg
            className={`h-5 w-5 transition-transform ${mobileOpen ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileOpen ? (
              <path
                d="M6 18L18 6M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 pb-5 pt-3 shadow-lg md:hidden">
          <nav className="space-y-4 text-sm">
            {/* All Categories section */}
            <div>
              <Link
                href="/products"
                className={`block rounded-xl px-3 py-2.5 font-semibold ${
                  isProductsPage
                    ? "bg-indigo-200 text-slate-900"
                    : "text-slate-100 hover:bg-slate-800 hover:text-indigo-100"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                All Categories
              </Link>
              {categories.length > 0 && (
                <div className="mt-1 max-h-56 space-y-0.5 overflow-y-auto pl-5">
                  {categories.map((c) => {
                    const iconUrl = c.iconPath ? `${BACKEND}${c.iconPath}` : null;
                    return (
                      <Link
                        key={c.id}
                        href={`/category/${c.id}`}
                        className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt=""
                            className="h-6 w-6 shrink-0 rounded-full bg-slate-100 p-0.5 object-contain"
                          />
                        ) : (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-900">
                            {c.name.charAt(0)}
                          </span>
                        )}
                        <span>{c.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shop section */}
            <div>
              <Link
                href="/shop"
                className={`block rounded-xl px-3 py-2.5 font-semibold ${
                  isShopPage
                    ? "bg-indigo-200 text-slate-900"
                    : "text-slate-100 hover:bg-slate-800 hover:text-indigo-100"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Shop
              </Link>
              <div className="mt-1 space-y-0.5 pl-5">
                <Link
                  href="/products/featured"
                  className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Featured
                </Link>
                <Link
                  href="/products/deals"
                  className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  Deals
                </Link>
                <Link
                  href="/products/clearance"
                  className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="19" y1="5" x2="5" y2="19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                  Clearance
                </Link>
                <Link
                  href="/products/best-sellers"
                  className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  Best Sellers
                </Link>
                <Link
                  href="/products/new"
                  className="flex items-center gap-3 rounded-lg py-2.5 pr-3 text-slate-200 hover:bg-slate-800 hover:text-indigo-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
                  </svg>
                  New Arrivals
                </Link>
              </div>
            </div>

            {/* About & Contact */}
            <div className="space-y-1 pt-1">
              <Link
                href="/about"
                className={`block rounded-xl px-3 py-2.5 font-semibold ${
                  pathname === "/about"
                    ? "bg-indigo-200 text-slate-900"
                    : "text-slate-100 hover:bg-slate-800 hover:text-indigo-100"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`block rounded-xl px-3 py-2.5 font-semibold ${
                  pathname === "/contact"
                    ? "bg-indigo-200 text-slate-900"
                    : "text-slate-100 hover:bg-slate-800 hover:text-indigo-100"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
