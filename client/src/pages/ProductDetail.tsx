import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, fetchProduct } from "../api/client";
import type { Product } from "../store/useStore";
import { DEFAULT_PRODUCT_IMAGE_URLS, useStore } from "../store/useStore";

const CATEGORY_LABELS: Record<string, string> = {
  accessories: "Accessories",
  deals: "Deals",
  devices: "Devices",
  disposables: "Disposables",
  general: "General",
  "nicotine-pouches": "Nicotine Pouches",
  papers: "Papers",
  "vape-juice": "Vape Juice",
};

function getImages(product: Product, modelIndex?: number): string[] {
  const models = product.models;
  if (models && models.length > 0 && modelIndex != null && models[modelIndex]) {
    const urls = models[modelIndex].imageUrls;
    if (urls && urls.length > 0) {
      return urls.length >= 3 ? urls.slice(0, 3) : [...urls, ...DEFAULT_PRODUCT_IMAGE_URLS].slice(0, 3);
    }
  }
  if (product.imageUrls && product.imageUrls.length >= 3) {
    return product.imageUrls.slice(0, 3);
  }
  const main = product.imageUrl || DEFAULT_PRODUCT_IMAGE_URLS[0];
  return [main, DEFAULT_PRODUCT_IMAGE_URLS[1], DEFAULT_PRODUCT_IMAGE_URLS[2]];
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const modelParam = searchParams.get("model");
  const navigate = useNavigate();
  const products = useStore((state) => state.products);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setError(null);
    const fromStore = products.find((p) => p.id === id);
    if (fromStore) {
      setProduct(fromStore);
      setLoading(false);
      return;
    }
    fetchProduct(id)
      .then((apiProduct) => {
        const categoryId = apiProduct.brand?.category?.id ?? "";
        const categoryName = apiProduct.brand?.category?.name ?? "";
        const models = (apiProduct.models ?? []).map((m) => ({
          id: m.id,
          name: m.name,
          price: typeof m.price === "number" ? m.price : parseFloat(String(m.price ?? 0)) || 0,
          description: m.description ?? "",
          flavors: m.flavors ?? [],
          imageUrls: m.imageUrls ?? [],
          is_clearance: m.is_clearance ?? false,
          is_deal: m.is_deal ?? false,
          deal_text: m.deal_text ?? null,
          is_best_seller: m.is_best_seller ?? false,
          is_new: m.is_new ?? false,
        }));
        const first = models[0];
        const allFlavors = [...new Set(models.flatMap((m) => m.flavors))];
        const dealModel = models.find((m) => m.is_deal);
        setProduct({
          id: apiProduct.id,
          name: apiProduct.name,
          description: first?.description ?? apiProduct.name,
          price: first?.price ?? 0,
          size: apiProduct.size ?? null,
          categoryId: categoryId || "general",
          categoryName: categoryName || "",
          subcategoryId: categoryId || "general",
          brand: apiProduct.brand?.name ?? "",
          nicotine_strength: apiProduct.nicotineStrength ?? null,
          flavor: allFlavors[0] ?? null,
          flavors: allFlavors.length > 0 ? allFlavors : undefined,
          product_line: first?.name ?? null,
          is_deal: models.some((m) => m.is_deal),
          deal_text: dealModel?.deal_text ?? null,
          is_active: true,
          is_best_seller: models.some((m) => m.is_best_seller),
          is_new: models.some((m) => m.is_new),
          is_clearance: models.some((m) => m.is_clearance),
          imageUrl: first?.imageUrls?.[0] ?? null,
          imageUrls: first?.imageUrls?.length ? first.imageUrls : undefined,
          models,
          hasMultipleModels: models.length > 1,
        });
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setProduct(null);
            setError(null);
          } else if (err.status >= 500) {
            setError("We ran into a server problem while loading this product. Please try again later.");
            setProduct(null);
          } else {
            setError(err.message);
            setProduct(null);
          }
        } else {
          setError("Failed to load this product. Please try again.");
          setProduct(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id, products]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  // Pre-select model from URL ?model=modelId
  useEffect(() => {
    if (!product || !product.models?.length || !modelParam) {
      setSelectedModelIndex(0);
      return;
    }
    const idx = product.models.findIndex((m) => m.id === modelParam);
    setSelectedModelIndex(idx >= 0 ? idx : 0);
  }, [product, modelParam]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-slate-600">Loading product…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900">Could not load product</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  const selectedModel = product.models?.[selectedModelIndex];
  const displayName = product.models && product.models.length > 1 && selectedModel
    ? `${product.name} - ${selectedModel.name}`
    : product.name;
  const displayPrice = selectedModel ? selectedModel.price : product.price;
  const displayDescription = selectedModel?.description ?? product.description;
  const displayFlavors = selectedModel?.flavors?.length ? selectedModel.flavors : product.flavors ?? (product.flavor ? [product.flavor] : []);
  const images = getImages(product, selectedModelIndex);
  const categoryLabel = product.categoryName || (CATEGORY_LABELS[product.categoryId] ?? product.categoryId);

  const badges: { label: string; colorClasses: string }[] = [];
  if (product.is_deal && product.deal_text) {
    badges.push({
      label: product.deal_text,
      colorClasses: "bg-amber-500 text-slate-900",
    });
  }
  if (product.is_best_seller) {
    badges.push({
      label: "Best seller",
      colorClasses: "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-400/40",
    });
  }
  if (product.is_new) {
    badges.push({
      label: "New arrival",
      colorClasses: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-400/40",
    });
  }
  if (product.is_clearance) {
    badges.push({
      label: "Clearance",
      colorClasses: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-400/40",
    });
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Slight background design */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,211,238,0.08),transparent),radial-gradient(ellipse_60%_80%_at_100%_50%,rgba(34,211,238,0.04),transparent),radial-gradient(ellipse_60%_80%_at_0%_80%,rgba(148,163,184,0.06),transparent)]"
        aria-hidden
      />
      <div className="rounded-3xl border border-slate-200/90 bg-white/80 px-4 py-8 shadow-lg shadow-slate-200/50 backdrop-blur sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {displayName}
            </h1>
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.colorClasses}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Image gallery: main poster + 3 thumbnails, constrained size */}
          <div className="w-full max-w-[340px] space-y-3 sm:max-w-[380px]">
            <div className="relative w-full h-[260px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-emerald-400/5" />
              <img
                src={images[selectedImageIndex]}
                alt={displayName}
                className="relative h-full w-full object-contain"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`group relative aspect-square overflow-hidden rounded-lg border bg-slate-50 transition-all ${
                    selectedImageIndex === index
                      ? "border-cyan-500 ring-2 ring-cyan-500/30"
                      : "border-slate-200 hover:border-cyan-400/60"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product properties */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Product details
              </p>
              <p className="mt-3 inline-flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-slate-900">
                  ${displayPrice.toFixed(2)}
                </span>
                {product.is_deal && product.deal_text && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-300/60">
                    {product.deal_text}
                  </span>
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                {displayDescription}
              </p>
              {product.is_clearance && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800 ring-1 ring-rose-200">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                  This item is part of our clearance selection — limited quantities available.
                </p>
              )}
            </div>

            <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </dt>
                <dd className="mt-1 text-slate-900">{categoryLabel}</dd>
              </div>
              {product.size && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Size
                  </dt>
                  <dd className="mt-1 text-slate-900">{product.size}</dd>
                </div>
              )}
              {product.brand && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Brand
                  </dt>
                  <dd className="mt-1 text-slate-900">{product.brand}</dd>
                </div>
              )}
              {selectedModel && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Model
                  </dt>
                  <dd className="mt-1 text-slate-900">{selectedModel.name}</dd>
                </div>
              )}
              
              {product.nicotine_strength && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nicotine strength
                  </dt>
                  <dd className="mt-1 text-slate-900">{product.nicotine_strength}</dd>
                </div>
              )}
            </dl>

            {/* Available flavor(s) — single or multiple, same bordered pill style with hover */}
            {displayFlavors.length > 0 && (() => {
              const flavorList = displayFlavors;
              if (flavorList.length === 0) return null;
              const isPlural = flavorList.length !== 1;
              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600" aria-hidden>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Available flavor{isPlural ? "s" : ""}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isPlural
                          ? `${flavorList.length} flavors — choose in store`
                          : "Choose in store"}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2" role="list">
                    {flavorList.map((flavor) => (
                      <li key={flavor}>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:border-cyan-300 hover:ring-cyan-200 hover:shadow">
                          {flavor}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <span className="text-xs text-slate-500">
                In-store purchase only. Check availability with your local Empire Vapor Shop.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
