import { create } from "zustand";
import { ApiError, fetchProducts } from "../api/client";
import type { ApiModel, ApiProductWithModels } from "../api/client";

/** Default product image in client public folder — used when imageUrl/imageUrls are empty */
const DEFAULT_PRODUCT_IMAGE_URL = "/product_default_image.jpg";

/** Array of the default image (for gallery fallback when 3 URLs are needed) */
export const DEFAULT_PRODUCT_IMAGE_URLS: [string, string, string] = [
  DEFAULT_PRODUCT_IMAGE_URL,
  DEFAULT_PRODUCT_IMAGE_URL,
  DEFAULT_PRODUCT_IMAGE_URL,
];

/** Parse nicotine_strength — may be "3mg", "3mg, 6mg", etc. Returns array of individual values */
export function parseNicotineStrengths(v: string | null | undefined): string[] {
  if (v == null || typeof v !== "string" || v.trim() === "") return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function parsePrice(v: number | string | null): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/** List item for product listing - one per model when product has multiple models */
export type ListProduct = {
  id: string;
  productId: string;
  modelId?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  brand: string;
  nicotine_strength: string | null;
  flavor: string | null;
  flavors?: string[];
  product_line: string | null;
  is_deal: boolean;
  deal_text: string | null;
  is_active: boolean;
  is_best_seller: boolean;
  is_new?: boolean;
  is_clearance?: boolean;
  imageUrl: string | null;
  imageUrls?: string[];
};

/** Display model - each model has its own price and description */
export type DisplayModel = {
  id: string;
  name: string;
  price: number;
  description: string;
  flavors: string[];
  imageUrls: string[];
  is_clearance: boolean;
  is_deal: boolean;
  deal_text: string | null;
  is_best_seller: boolean;
  is_new: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  size?: string | null;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  brand: string;
  nicotine_strength: string | null;
  flavor: string | null;
  flavors?: string[];
  product_line: string | null;
  is_deal: boolean;
  deal_text: string | null;
  is_active: boolean;
  is_best_seller: boolean;
  is_new?: boolean;
  is_clearance?: boolean;
  imageUrl: string | null;
  imageUrls?: string[];
  /** Each model has different price/description; used for model selector on detail page */
  models?: DisplayModel[];
  /** True when multiple models available (price range e.g. "From $X") */
  hasMultipleModels?: boolean;
};

type StoreState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
};

function mapApiModel(m: ApiModel): DisplayModel {
  return {
    id: m.id,
    name: m.name,
    price: parsePrice(m.price),
    description: m.description ?? "",
    flavors: m.flavors ?? [],
    imageUrls: m.imageUrls ?? [],
    is_clearance: m.is_clearance ?? false,
    is_deal: m.is_deal ?? false,
    deal_text: m.deal_text ?? null,
    is_best_seller: m.is_best_seller ?? false,
    is_new: m.is_new ?? false,
  };
}

function mapApiProductToDisplay(p: ApiProductWithModels): Product {
  const models = (p.models ?? []).map(mapApiModel);
  const first = models[0];
  const categoryId = p.brand?.category?.id ?? "";
  const categoryName = p.brand?.category?.name ?? "";
  const allFlavors = [...new Set(models.flatMap((m) => m.flavors))];
  const price = first ? first.price : 0;
  const hasMultiple = models.length > 1;
  const prices = models.map((m) => m.price).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  
  return {
    id: p.id,
    name: p.name,
    description: first?.description ?? p.name,
    price: hasMultiple ? minPrice : price,
    size: p.size ?? null,
    categoryId: categoryId || "general",
    categoryName: categoryName || "",
    subcategoryId: categoryId || "general",
    brand: p.brand?.name ?? "",
    nicotine_strength: p.nicotineStrength ?? null,
    flavor: allFlavors[0] ?? null,
    flavors: allFlavors.length > 0 ? allFlavors : undefined,
    product_line: first?.name ?? null,
    is_deal: models.some((m) => m.is_deal),
    deal_text: (models.find((m) => m.is_deal)?.deal_text) ?? null,
    is_active: true,
    is_best_seller: models.some((m) => m.is_best_seller),
    is_new: models.some((m) => m.is_new),
    is_clearance: models.some((m) => m.is_clearance),
    imageUrl: first?.imageUrls?.[0] ?? null,
    imageUrls: first?.imageUrls?.length ? first.imageUrls : DEFAULT_PRODUCT_IMAGE_URLS,
    models: models.length > 0 ? models : undefined,
    hasMultipleModels: hasMultiple,
  };
}

/** Expand products for listing: products with multiple models become multiple list items (A-b, A-c) */
export function expandProductsForListing(products: Product[]): ListProduct[] {
  const result: ListProduct[] = [];
  for (const p of products) {
    if (!p.is_active) continue;
    if (p.models && p.models.length > 0) {
      const showModelInName = p.models.length > 1;
      for (const m of p.models) {
        result.push({
          id: `${p.id}_${m.id}`,
          productId: p.id,
          modelId: m.id,
          name: showModelInName ? `${p.name} - ${m.name}` : p.name,
          description: m.description,
          price: m.price,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          subcategoryId: p.subcategoryId,
          brand: p.brand,
          nicotine_strength: p.nicotine_strength,
          flavor: m.flavors[0] ?? null,
          flavors: m.flavors.length > 0 ? m.flavors : undefined,
          product_line: m.name,
          is_deal: m.is_deal,
          deal_text: m.is_deal ? (m.deal_text ?? null) : null,
          is_active: true,
          is_best_seller: m.is_best_seller,
          is_new: m.is_new,
          is_clearance: m.is_clearance,
          imageUrl: m.imageUrls[0] ?? null,
          imageUrls: m.imageUrls.length > 0 ? m.imageUrls : undefined,
        });
      }
    } else {
      result.push({
        id: p.id,
        productId: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        subcategoryId: p.subcategoryId,
        brand: p.brand,
        nicotine_strength: p.nicotine_strength,
        flavor: p.flavor,
        flavors: p.flavors,
        product_line: p.product_line,
        is_deal: p.is_deal,
        deal_text: p.deal_text,
        is_active: true,
        is_best_seller: p.is_best_seller ?? false,
        is_new: p.is_new,
        is_clearance: p.is_clearance,
        imageUrl: p.imageUrl,
        imageUrls: p.imageUrls,
      });
    }
  }
  return result;
}

export const useStore = create<StoreState>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProducts();
      const products = data.map(mapApiProductToDisplay);
      set({ products, loading: false, error: null });
    } catch (err) {
      let message = "Failed to load products.";
      if (err instanceof ApiError) {
        if (err.status === 404) {
          message = "No products were found (404).";
        } else if (err.status >= 500) {
          message = "We couldn't connect to the store right now. Please try again in a moment.";
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({
        products: [],
        loading: false,
        error: message,
      });
    }
  },
}));
