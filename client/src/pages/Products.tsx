import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductListing";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";
import type { ListProduct } from "../store/useStore";
import { expandProductsForListing, parseNicotineStrengths, useStore } from "../store/useStore";

const PAGE_SIZE = 6;

function useProductsFilters(products: ListProduct[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const model = searchParams.get("model") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const nicotine = searchParams.get("nicotine") ?? "";
  const dealsOnly = searchParams.get("dealsOnly") === "1";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (p: ListProduct) =>
      !search ||
      p.name.toLowerCase().includes(searchLower) ||
      (p.brand?.toLowerCase().includes(searchLower) ?? false) ||
      (p.product_line?.toLowerCase().includes(searchLower) ?? false);

    return products.filter((p) => {
      if (!p.is_active) return false;
      if (category && p.categoryId !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (model && p.product_line !== model) return false;
      const min = minPrice ? parseFloat(minPrice) : null;
      const max = maxPrice ? parseFloat(maxPrice) : null;
      if (min != null && p.price < min) return false;
      if (max != null && p.price > max) return false;
      if (nicotine && !parseNicotineStrengths(p.nicotine_strength).includes(nicotine)) return false;
      if (dealsOnly && !p.is_deal) return false;
      if (!matchesSearch(p)) return false;
      return true;
    });
  }, [
    products,
    category,
    brand,
    model,
    minPrice,
    maxPrice,
    nicotine,
    dealsOnly,
    search,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return {
    filters: {
      category,
      brand,
      model,
      minPrice,
      maxPrice,
      nicotine,
      dealsOnly,
      search,
    },
    setFilter,
    setPage,
    filtered,
    paginated,
    totalPages,
    currentPage,
    totalCount: filtered.length,
  };
}

export function Products() {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);

  const {
    filters,
    setFilter,
    setPage,
    paginated,
    totalPages,
    currentPage,
    totalCount,
  } = useProductsFilters(expandProductsForListing(products));

  const listProducts = useMemo(() => expandProductsForListing(products), [products]);
  const categoryOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const p of listProducts) {
      if (p.categoryId && !byId.has(p.categoryId)) {
        byId.set(p.categoryId, p.categoryName || p.categoryId);
      }
    }
    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [listProducts]);
  const brands = useMemo(
    () => Array.from(new Set(listProducts.map((p) => p.brand))).sort(),
    [listProducts]
  );
  const nicotineOptions = useMemo(
    () =>
      Array.from(
        new Set(
          listProducts.flatMap((p) => parseNicotineStrengths(p.nicotine_strength))
        )
      ).sort(),
    [listProducts]
  );
  const modelOptions = useMemo(
    () =>
      Array.from(new Set(listProducts.filter((p) => p.product_line).map((p) => p.product_line!))).sort(),
    [listProducts]
  );

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";
  const selectClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

  const filterControls = (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[140px] flex-1 sm:min-w-[160px]">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Search
        </label>
        <input
          type="search"
          placeholder="Name, brand, or model..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className={`w-full ${inputClass}`}
        />
      </div>
      <div className="w-full min-w-[120px] sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {categoryOptions.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-[120px] sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Brand
        </label>
        <select
          value={filters.brand}
          onChange={(e) => setFilter("brand", e.target.value)}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      {modelOptions.length > 0 && (
        <div className="w-full min-w-[120px] sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => setFilter("model", e.target.value)}
            className={`w-full ${selectClass}`}
          >
            <option value="">All</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-2">
        <div className="w-20">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Min $
          </label>
          <input
            type="number"
            placeholder="Min"
            min={0}
            step={0.01}
            value={filters.minPrice}
            onChange={(e) => setFilter("minPrice", e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>
        <div className="w-20">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Max $
          </label>
          <input
            type="number"
            placeholder="Max"
            min={0}
            step={0.01}
            value={filters.maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>
      </div>
      <div className="w-full min-w-[120px] sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Nicotine
        </label>
        <select
          value={filters.nicotine}
          onChange={(e) => setFilter("nicotine", e.target.value)}
          className={`w-full ${selectClass}`}
        >
          <option value="">All</option>
          {nicotineOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 py-2">
        <input
          type="checkbox"
          checked={filters.dealsOnly}
          onChange={(e) =>
            setFilter("dealsOnly", e.target.checked ? "1" : "")
          }
          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm text-slate-700">Deals only</span>
      </label>
    </div>
  );

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile: Filters button */}
      <div className="mb-4 md:hidden">
        <button
          type="button"
          onClick={() => setFiltersModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Desktop: Filters at top */}
      <div className="mb-6 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Filters</h2>
        {filterControls}
      </div>

      {/* Mobile: Filters modal */}
      {filtersModalOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
          aria-labelledby="filters-modal-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setFiltersModalOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <h2 id="filters-modal-title" className="text-lg font-semibold text-slate-900">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersModalOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 p-4">
              {filterControls}
              <button
                type="button"
                onClick={() => setFiltersModalOpen(false)}
                className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="mb-4 max-w-xl rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 shadow-sm">
          <p className="font-semibold">We couldn&apos;t load products.</p>
          <p className="mt-1 text-rose-900/90">
            Please check your connection and try again shortly.
          </p>
        </div>
      ) : null}

      <p className="mb-4 text-sm text-slate-600">
        {loading ? (
          <span className="animate-pulse">Loading products…</span>
        ) : (
          <>
            Showing {paginated.length} of {totalCount} product
            {totalCount !== 1 ? "s" : ""}
          </>
        )}
      </p>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
          No products match your filters. Try adjusting or clearing them.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
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
                  )
                )}
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
    </div>
  );
}
