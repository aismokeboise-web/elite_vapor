interface AdminSkeletonProps {
  title?: string;
  /** Number of card-style skeleton rows (for list pages) */
  cards?: number;
  /** Show header row + table-style skeleton rows */
  tableRows?: number;
  className?: string;
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 rounded bg-slate-200 ${className}`}
      aria-hidden
    />
  );
}

export function AdminSkeleton({ cards = 5, tableRows = 0, className = "" }: AdminSkeletonProps) {
  return (
    <div className={`mx-auto max-w-5xl ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-48" />
          <SkeletonBar className="h-4 w-32" />
        </div>
        <SkeletonBar className="h-10 w-32 rounded-lg" />
      </div>

      <div className="mt-6">
        <SkeletonBar className="h-10 w-full max-w-xl rounded-lg" />
      </div>

      {tableRows > 0 ? (
        <div className="mt-8 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex gap-4 border-b border-slate-200 pb-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBar key={i} className="h-5 w-24" />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: tableRows }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <SkeletonBar className="h-5 w-1/4" />
                <SkeletonBar className="h-5 w-1/5" />
                <SkeletonBar className="h-5 w-1/5" />
                <SkeletonBar className="h-5 w-20 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {Array.from({ length: cards }).map((_, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <SkeletonBar className="h-5 w-40" />
                    <SkeletonBar className="h-5 w-24" />
                    <SkeletonBar className="h-5 w-20" />
                  </div>
                  <SkeletonBar className="h-4 w-full max-w-md" />
                  <div className="flex gap-4">
                    <SkeletonBar className="h-3 w-28" />
                    <SkeletonBar className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SkeletonBar className="h-8 w-16 rounded-lg" />
                  <SkeletonBar className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
