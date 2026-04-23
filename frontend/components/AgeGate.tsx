"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "elite-age-verified";
const TTL_MS = 60 * 60 * 1000; // 1 hour

function getStoredExpiry(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { expiresAt } = JSON.parse(raw) as { expiresAt?: number };
    if (typeof expiresAt !== "number") return null;
    return expiresAt;
  } catch {
    return null;
  }
}

function isVerified(): boolean {
  const expiresAt = getStoredExpiry();
  return expiresAt != null && Date.now() < expiresAt;
}

function setVerified() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ expiresAt: Date.now() + TTL_MS })
    );
  } catch {
    // ignore
  }
}

export function AgeGate({ children }: { children: React.ReactNode }) {
  // Start as null (unknown). After hydration, check localStorage.
  // IMPORTANT: We ALWAYS render children immediately so the page content
  // is visible to crawlers and painted on first render (critical for LCP/FCP).
  // The overlay is shown ONLY when we confirm the user is NOT verified.
  const [verified, setVerifiedState] = useState<boolean | null>(null);

  useEffect(() => {
    setVerifiedState(isVerified());
  }, []);

  const handleConfirm = () => {
    setVerified();
    setVerifiedState(true);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <>
      {/* Always render page content — critical for FCP, LCP, and SEO crawlability */}
      {children}

      {/* Age-gate overlay appears only AFTER hydration confirms user is not verified.
          verified === null → hydrating, overlay hidden (content visible briefly)
          verified === false → overlay shown
          verified === true → no overlay */}
      {verified === false && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-300/80 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-300/40 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 sm:h-14 sm:w-14">
                <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 id="age-gate-title" className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                Are you 21 or older?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                You must be of legal age to view this site.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                type="button"
                onClick={handleConfirm}
                className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition duration-100 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-[0.98]"
              >
                Yes, I confirm
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-100 hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 active:scale-[0.98]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
