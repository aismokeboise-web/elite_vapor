"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Optional: show compact form when true (fewer page numbers) */
  compact?: boolean;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  compact = false,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems > 0) return null;
  if (totalItems === 0) return null;

  const handleClick = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    // Defer scroll so it runs after React re-renders the new page
    requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
  };

  // Build page numbers to show: first, ... window ..., last
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const win = compact ? 2 : 3;
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage - win > 2) pages.push("ellipsis");
    for (let i = Math.max(2, currentPage - win); i <= Math.min(totalPages - 1, currentPage + win); i++) {
      pages.push(i);
    }
    if (currentPage + win < totalPages - 1) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages.filter((p, i, arr) => p === "ellipsis" || arr.indexOf(p) === i);
  };

  const pages = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const btnBase =
    "inline-flex h-10 min-w-[2.5rem] cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";
  const btnPrevNext =
    "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-indigo-700 hover:shadow-md active:scale-[0.98]";
  const btnPage =
    "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-indigo-700 hover:shadow-md hover:scale-105 active:scale-[0.98]";
  const btnCurrent =
    "border-indigo-500 bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400/70 cursor-default hover:scale-100 hover:bg-indigo-600 hover:border-indigo-500";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 py-5 sm:gap-3"
    >
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-50/80 p-1.5 shadow-inner sm:gap-2 sm:p-2">
        <button
          type="button"
          onClick={() => handleClick(currentPage - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
          className={`${btnBase} ${btnPrevNext}`}
        >
          <span className="sr-only sm:not-sr-only sm:mr-0.5">Prev</span>
          <svg className="h-4 w-4 sm:ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} className="flex h-10 w-8 items-center justify-center text-slate-400" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => handleClick(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
                className={`${btnBase} ${p === currentPage ? btnCurrent : btnPage}`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => handleClick(currentPage + 1)}
          disabled={!hasNext}
          aria-label="Next page"
          className={`${btnBase} ${btnPrevNext}`}
        >
          <span className="sr-only sm:not-sr-only sm:ml-0.5">Next</span>
          <svg className="h-4 w-4 sm:mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
