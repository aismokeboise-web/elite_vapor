import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductListing";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import { expandProductsForListing, useStore } from "../store/useStore";

const PAGE_SIZE = 6;

export function NewProducts() {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [searchParams, setSearchParams] = useSearchParams();

  const newProducts = useMemo(
    () => expandProductsForListing(products).filter((p) => p.is_new === true),
    [products]
  );

  const pageParam = searchParams.get("page") ?? "1";
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const totalPages = Math.max(1, Math.ceil(newProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return newProducts.slice(start, start + PAGE_SIZE);
  }, [newProducts, currentPage]);

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          New products
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse the latest additions to our catalog.
        </p>
      </div>

      {error && (
        <div className="mb-4 max-w-xl rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 shadow-sm">
          <p className="font-semibold">We couldn&apos;t load new products.</p>
          <p className="mt-1 text-rose-900/90">
            Please check your connection and try again shortly.
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : newProducts.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
          No new products are available right now. Please check back later.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Showing {paginated.length} of {newProducts.length} new product
            {newProducts.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="New products pagination"
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      p === currentPage
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

