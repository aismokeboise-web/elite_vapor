"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";
const PLACEHOLDER_IMAGE = "/images/product_placeholder.jpg";

type Category = { id: string; name: string };
type Model = {
  id: string;
  name: string;
  price: string;
  description: string | null;
  flavors: string[];
  is_clearance: boolean;
  is_deal: boolean;
  deal_text: string | null;
  is_best_seller: boolean;
  is_new: boolean;
  is_featured: boolean;
  imageUrls: string[];
};
type Product = {
  id: string;
  name: string;
  size: string | null;
  nicotineStrength: string | null;
  brand: { id: string; name: string; category: Category };
  models: Model[];
};

function ModelBadges({ m }: { m: Model }) {
  const badges: { label: string; className: string }[] = [];
  if (m.is_clearance) badges.push({ label: "Clearance", className: "bg-amber-400 text-slate-900" });
  if (m.is_deal) badges.push({ label: "Deal", className: "bg-rose-500 text-white" });
  if (m.is_best_seller) badges.push({ label: "Best Seller", className: "bg-emerald-500 text-white" });
  if (m.is_new) badges.push({ label: "New", className: "bg-sky-500 text-white" });
  if (m.is_featured) badges.push({ label: "Featured", className: "bg-violet-500 text-white" });
  if (badges.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.className}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id || !BACKEND) return;
    fetch(`${BACKEND}/api/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-slate-600">Product not found.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-slate-700 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const models = product.models || [];
  const selectedModel = models[selectedModelIndex] || models[0];
  const images = selectedModel?.imageUrls ?? [];
  const mainImageIndex = Math.min(selectedImageIndex, Math.max(0, images.length - 1));
  const mainImage = images[mainImageIndex];
  const imageUrl = mainImage ? `${BACKEND}${mainImage}` : PLACEHOLDER_IMAGE;
  const thumbnails = images.length > 1
    ? images.map((url, i) => ({ url, i })).filter(({ i: idx }) => idx !== mainImageIndex)
    : [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Breadcrumb / page header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-sm ring-1 ring-indigo-500/40 transition hover:bg-indigo-500 hover:shadow-md hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <span className="text-slate-400">/</span>
              <Link href="/" className="text-slate-700 hover:text-slate-900 hover:underline">
                Home
              </Link>
              <span aria-hidden className="text-slate-400">/</span>
              <Link
                href={`/category/${product.brand.category.id}`}
                className="text-slate-700 hover:text-slate-900 hover:underline"
              >
                {product.brand.category.name}
              </Link>
            </div>
            <div className="text-center">
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image gallery: one large + thumbnails below; click thumbnail to set main */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={imageUrl}
                alt={selectedModel?.name || product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {thumbnails.length >= 1 && (
              <div className="flex gap-3">
                {thumbnails.map(({ url, i }) => {
                  const src = url ? `${BACKEND}${url}` : PLACEHOLDER_IMAGE;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className="flex-1 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 transition hover:border-slate-400 hover:opacity-90 cursor-pointer"
                    >
                      <div className="aspect-[4/5] w-full bg-slate-100">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {models.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {models.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelectedModelIndex(i); setSelectedImageIndex(0); }}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                      selectedModelIndex === i
                        ? "border-slate-600 bg-slate-100 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {/* Product details: category, brand, model, size, nicotine */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product details
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Category</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">
                    <Link href={`/category/${product.brand.category.id}`} className="hover:underline">
                      {product.brand.category.name}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Brand</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">{product.brand.name}</dd>
                </div>
                {selectedModel && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Model</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{selectedModel.name}</dd>
                  </div>
                )}
                {product.size != null && product.size !== "" && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Size</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{product.size}</dd>
                  </div>
                )}
                {product.nicotineStrength != null && product.nicotineStrength !== "" && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Nicotine strength</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{product.nicotineStrength}</dd>
                  </div>
                )}
              </dl>
            </div>

            {selectedModel && (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Price
                      </span>
                      <p className="text-2xl font-semibold tracking-tight text-slate-900">
                        ${selectedModel.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {selectedModel.is_deal && (
                        <span className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                          {selectedModel.deal_text && selectedModel.deal_text.trim() !== ""
                            ? selectedModel.deal_text
                            : "On Sale"}
                        </span>
                      )}
                      <ModelBadges m={selectedModel} />
                    </div>
                  </div>
                </div>

                {selectedModel.description != null && selectedModel.description.trim() !== "" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</h2>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedModel.description}
                    </p>
                  </div>
                )}

                {selectedModel.flavors?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flavors</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedModel.flavors.map((f, i) => {
                        const colors = [
                          "bg-amber-100 text-amber-800 border-amber-200",
                          "bg-rose-100 text-rose-800 border-rose-200",
                          "bg-emerald-100 text-emerald-800 border-emerald-200",
                          "bg-sky-100 text-sky-800 border-sky-200",
                          "bg-violet-100 text-violet-800 border-violet-200",
                          "bg-orange-100 text-orange-800 border-orange-200",
                        ];
                        const style = colors[i % colors.length];
                        return (
                          <span
                            key={f}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${style}`}
                          >
                            {f}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {models.length > 1 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  All variants ({models.length})
                </h2>
                <ul className="mt-3 space-y-2">
                  {models.map((m, i) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedModelIndex(i); setSelectedImageIndex(0); }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-left transition hover:bg-slate-50 ${
                          selectedModelIndex === i
                            ? "border-slate-600 bg-slate-50 ring-1 ring-slate-600"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="font-medium text-slate-900">{m.name}</span>
                        <span className="font-semibold text-slate-900">${m.price}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/category/${product.brand.category.id}`}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                More in {product.brand.category.name}
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {models.length > 1 && (
          <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">All models</h2>
            <p className="mt-1 text-sm text-slate-500">Click a model to view its price, images, and details.</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((m, i) => {
                const img = m.imageUrls?.[0] ? `${BACKEND}${m.imageUrls[0]}` : PLACEHOLDER_IMAGE;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelectedModelIndex(i); setSelectedImageIndex(0); }}
                    className={`flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:border-slate-400 hover:shadow ${
                      selectedModelIndex === i
                        ? "ring-2 ring-slate-600 border-slate-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="aspect-square h-32 w-full shrink-0 bg-slate-100 sm:h-36">
                      <img src={img} alt={m.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-slate-900 line-clamp-1">{m.name}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">${m.price}</p>
                      <ModelBadges m={m} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
