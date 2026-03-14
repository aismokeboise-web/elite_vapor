import type { ReactNode } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PublicNavBar } from "@/components/PublicNavBar";
import { ChatWidget } from "@/components/ChatWidget";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();
  return (
    <AgeGate>
      <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
        <PublicNavBar />
        <main className="flex-1">{children}</main>
        <ChatWidget />
      <footer className="border-t border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-3 sm:px-6 sm:pt-8 sm:pb-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-[15px] font-semibold uppercase text-slate-100">
                Elite Vapor
              </h3>
              <p className="text-[15px] text-slate-100">
                Premium vaping products and accessories with a focus on quality and service.
              </p>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-slate-100">Shop</h4>
              <ul className="mt-3 space-y-2 text-[14px]">
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
              <h4 className="text-[15px] font-semibold text-slate-100">Company</h4>
              <ul className="mt-3 space-y-2 text-[14px]">
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
              <h4 className="text-[15px] font-semibold text-slate-100">Follow Us</h4>
              <p className="mt-3 text-[14px] text-slate-100">
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
                      <radialGradient id="igGrad" cx="30%" cy="30%" r="90%">
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
                      fill="url(#igGrad)"
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
          <div className="mt-4 border-t border-slate-800 pt-2 pb-1 text-center text-sm font-medium text-slate-100">
            © {year} Elite Vapor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </AgeGate>
  );
}

