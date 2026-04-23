"use client";

type Category = { id: string; name: string };
type Brand = { id: string; name: string; categoryId: string };
type ModelSummary = { id: string; name: string };

type ListingFiltersProps = {
  search: string;
  onSearchChange: (v: string) => void;
  categoryId: string;
  onCategoryChange: (v: string) => void;
  brandId: string;
  onBrandChange: (v: string) => void;
  categories: Category[];
  brands: Brand[];
  placeholder?: string;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  modelId: string;
  onModelChange: (v: string) => void;
  models?: ModelSummary[];
};

export function ListingFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  brandId,
  onBrandChange,
  categories,
  brands,
  placeholder = "Search products…",
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  modelId,
  onModelChange,
  models,
}: ListingFiltersProps) {
  const modelOptions: ModelSummary[] = models ?? [];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:gap-5 sm:p-5">
      <div className="min-w-[220px] flex-1">
        <label htmlFor="listing-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <input
            id="listing-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
          />
        </div>
      </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="listing-category"
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900"
            >
              Category
            </label>
            <select
              id="listing-category"
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="listing-brand"
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900"
            >
              Brand
            </label>
            <select
              id="listing-brand"
              value={brandId}
              onChange={(e) => onBrandChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
            >
              <option value="">All</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">
              Price
            </span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="Min"
              className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
            />
            <span className="text-xs text-slate-400">–</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="Max"
              className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
            />
          </div>
          {modelOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">
                Model
              </label>
              <select
                value={modelId}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/15"
              >
                <option value="">All</option>
                {modelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
