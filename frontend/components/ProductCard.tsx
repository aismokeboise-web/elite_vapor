"use client";

import Link from "next/link";
import { motion } from "motion/react";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";
const PLACEHOLDER_IMAGE = "/images/product_placeholder.jpg";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  size?: string | null;
  nicotineStrength?: string | null;
  brand: { id: string; name: string; category: { id: string; name: string } };
  models: {
    id: string;
    name: string;
    price: string;
    imageUrls: string[];
    description?: string | null;
    flavors?: string[];
    is_deal?: boolean;
    deal_text?: string | null;
    is_clearance?: boolean;
    is_best_seller?: boolean;
    is_new?: boolean;
    is_featured?: boolean;
  }[];
};

type ProductCardProps = {
  product: Product;
  delay?: number;
};

export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const firstModel = product.models?.[0];
  const img = firstModel?.imageUrls?.[0] ? `${BACKEND}${firstModel.imageUrls[0]}` : PLACEHOLDER_IMAGE;
  const price = firstModel ? firstModel.price : null;
  const description = (firstModel?.description && firstModel.description.trim() !== "")
    ? firstModel.description
    : product.description && product.description.trim() !== ""
    ? product.description
    : null;
  const flavors = Array.isArray(firstModel?.flavors) ? firstModel!.flavors : [];
  const isDeal = !!firstModel?.is_deal;
  const dealLabel = (firstModel?.deal_text && firstModel.deal_text.trim() !== "") ? firstModel.deal_text : "On Sale";
  const flagBadges: { label: string; className: string }[] = [];
  if (firstModel?.is_clearance) flagBadges.push({ label: "Clearance", className: "bg-amber-400 text-slate-900" });
  if (firstModel?.is_deal) flagBadges.push({ label: "Deal", className: "bg-rose-500 text-white" });
  if (firstModel?.is_best_seller) flagBadges.push({ label: "Best Seller", className: "bg-emerald-500 text-white" });
  if (firstModel?.is_new) flagBadges.push({ label: "New", className: "bg-sky-500 text-white" });
  if (firstModel?.is_featured) flagBadges.push({ label: "Featured", className: "bg-violet-500 text-white" });
  const badgesOnImage = firstModel?.is_deal
    ? flagBadges.filter((b) => b.label !== "Deal")
    : flagBadges;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay * 0.05 }}
    >
      <Link
        href={`/product/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        {/* Fixed-height image area so all cards match */}
        <div className="relative flex h-52 w-full shrink-0 items-center justify-center bg-slate-100 sm:h-56">
          <img
            src={img}
            alt={product.name}
            className="block h-full w-full object-contain object-center transition duration-300 group-hover:scale-[1.02]"
          />
          {isDeal && (
            <span
              className="absolute left-2 top-2 inline-flex items-center rounded-full bg-fuchsia-500 px-2 py-1 text-[12px] font-semibold text-white shadow-sm"
              title={dealLabel}
            >
              <span className="inline-block max-w-[120px] truncate" title={dealLabel}>
                {dealLabel}
              </span>
            </span>
          )}
          {badgesOnImage.length > 0 && (
            <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
              {badgesOnImage.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-semibold text-white shadow-sm ${b.className}`}
                  title={b.label}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3
            className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-slate-950 transition group-hover:text-slate-800 sm:text-xl"
            title={product.name}
          >
            {product.name}
          </h3>
          <div className="mt-2 h-px w-full bg-slate-200 shadow-[0_1px_1px_rgba(15,23,42,0.12)]" />
          {description && (
            <>
              <p className="mt-2 line-clamp-2 min-h-[3.4rem] text-sm leading-relaxed text-slate-700">
                {description}
              </p>
              <div className="mt-2 h-px w-full bg-slate-200 shadow-[0_1px_1px_rgba(15,23,42,0.12)]" />
            </>
          )}
          <div className="mt-2 space-y-0.5 text-sm text-slate-600">
            <div className="flex">
              <span className="mr-1 shrink-0">Category:</span>
              <span className="flex-1 truncate text-slate-700">
                {product.brand.category.name}
              </span>
            </div>
            {firstModel && (
              <div className="flex">
                <span className="mr-1 shrink-0">Model:</span>
                <span className="flex-1 truncate text-slate-700">
                  {firstModel.name}
                </span>
              </div>
            )}
          </div>
          {(product.size != null && product.size !== "") ||
          (product.nicotineStrength != null && product.nicotineStrength !== "") ? (
            <div className="mt-1 space-y-0.5 text-sm text-slate-600">
              {product.size != null && product.size !== "" && (
                <div className="flex">
                  <span className="mr-1 shrink-0">Size:</span>
                  <span className="flex-1 truncate text-slate-700">
                    {product.size}
                  </span>
                </div>
              )}
              {product.nicotineStrength != null && product.nicotineStrength !== "" && (
                <div className="flex">
                  <span className="mr-1 shrink-0">Nicotine:</span>
                  <span className="flex-1 truncate text-slate-700">
                    {product.nicotineStrength}
                  </span>
                </div>
              )}
            </div>
          ) : null}
          {flavors.length > 0 && (
            <div className="mt-2 flex min-w-0 items-baseline gap-1 overflow-hidden text-sm text-slate-700">
              <span className="shrink-0 text-slate-800">Flavors:</span>
              <span className="min-w-0 truncate">
                {flavors.slice(0, 2).join(", ")}
                {flavors.length > 2 && (
                  <>
                    {flavors.length >= 3 && ", "}
                    <span className="font-medium text-slate-900">+{flavors.length - 2}</span>
                  </>
                )}
              </span>
            </div>
          )}
          {price != null && (
            <div className="mt-2">
              <p className="text-sm text-slate-700">
                Price:{" "}
                <span className="text-base font-semibold text-emerald-700">
                  ${price}
                </span>
              </p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
