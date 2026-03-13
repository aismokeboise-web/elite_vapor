import Link from "next/link";
import { PublicNavBar } from "@/components/PublicNavBar";

export default function RootNotFoundPage() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      {/* Client-side public navbar */}
      <PublicNavBar />

      {/* Main 404 content */}
      <main className="flex-1">
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-8 sm:py-12">
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
      </main>

      {/* Same footer styling as client-side public layout */}
      <footer className="border-t border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-slate-100">
                Elite Vapor
              </h3>
              <p className="text-sm text-slate-100">
                Premium vaping products and accessories with a focus on quality and service.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Shop</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/products" className="hover:text-indigo-300">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/products/featured" className="hover:text-indigo-300">
                    Featured
                  </Link>
                </li>
                <li>
                  <Link href="/products/deals" className="hover:text-indigo-300">
                    Deals
                  </Link>
                </li>
                <li>
                  <Link href="/products/clearance" className="hover:text-indigo-300">
                    Clearance
                  </Link>
                </li>
                <li>
                  <Link href="/products/best-sellers" className="hover:text-indigo-300">
                    Best sellers
                  </Link>
                </li>
                <li>
                  <Link href="/products/new" className="hover:text-indigo-300">
                    New arrivals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Company</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-indigo-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-indigo-300">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-indigo-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Follow Us</h4>
              <p className="mt-3 text-sm text-slate-100">
                Stay up to date with new arrivals and offers.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-100 transition hover:border-indigo-400 hover:text-indigo-300"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.5 4H13C10.79 4 9 5.79 9 8v2H7v3h2v7h3v-7h3l1-3h-4V8c0-.55.45-1 1-1h2.5V4Z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-100 transition hover:border-indigo-400 hover:text-indigo-300"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="igGrad404" cx="30%" cy="30%" r="90%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                        <stop offset="40%" stopColor="currentColor" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                      </radialGradient>
                    </defs>
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="url(#igGrad404)"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="17" cy="7" r="0.9" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-4 text-center text-xs text-slate-100">
            © {year} Elite Vapor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
