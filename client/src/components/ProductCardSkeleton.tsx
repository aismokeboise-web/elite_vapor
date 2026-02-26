export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-200/50">
      <div className="relative flex aspect-[4/3] min-h-[140px] animate-pulse items-center justify-center overflow-hidden bg-slate-200" />
      <div className="flex flex-1 flex-col p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 flex gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-auto flex flex-col pt-4">
          <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-11 w-32 animate-pulse self-center rounded-xl bg-slate-200" />
        </div>
      </div>
    </article>
  );
}
