import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden
    />
  );
}

/** Skeleton for a card in a grid (header + body lines) */
function CardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Image area skeleton */}
      <div className="relative flex h-52 w-full shrink-0 items-center justify-center bg-slate-100 sm:h-56">
        <Skeleton className="h-4/5 w-4/5 rounded-xl bg-slate-200/90" />
      </div>
      {/* Body content skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Description lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-1 h-px w-full bg-slate-200" />
        {/* Meta rows (category/model) */}
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        {/* Price row */}
        <Skeleton className="mt-1 h-4 w-1/3" />
      </div>
    </div>
  );
}

/** Grid of card skeletons for list pages (categories, brands, products, etc.) */
export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for the profile page (avatar, title, details list) */
export function ProfileSkeleton() {
  return (
    <section className="admin-card overflow-hidden rounded-2xl border border-slate-200/80 shadow-lg">
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-4 sm:px-8">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 flex-1 max-w-[200px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
