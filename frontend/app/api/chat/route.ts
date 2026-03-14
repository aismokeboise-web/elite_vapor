import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

const MAX_DEALS = 30;
const MAX_CLEARANCE = 30;
const MAX_FEATURED = 15;
const MAX_NEW = 15;
const MAX_BEST_SELLERS = 15;
const MAX_PRODUCTS_SUMMARY = 80;

type ModelItem = {
  name?: string;
  price?: number | string;
  is_deal?: boolean;
  is_clearance?: boolean;
  deal_text?: string | null;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  product?: { name?: string; brand?: { name?: string } };
};

type CategoryShape = { id?: string; name?: string };

const STORE_CONTEXT_TTL_MS = 10 * 60 * 1000; // 10 minutes (aligned with backend API cache)
const BACKEND_API_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type BackendApiKey = "categories" | "models" | "products" | "brands";
const backendApiCache: Partial<Record<BackendApiKey, { data: unknown; expiresAt: number }>> = {};

let storeContextCache: { value: string; expiresAt: number } | null = null;

/** Public site base URL for navigation links the assistant can give to users */
const SITE_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://elitevaporboise.com";

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

async function getCachedBackendApi<T>(key: BackendApiKey, url: string): Promise<T> {
  const now = Date.now();
  const entry = backendApiCache[key];
  if (entry && entry.expiresAt > now) {
    return entry.data as T;
  }
  const res = await fetch(url);
  const data = res.ok ? (await res.json()) : (key === "categories" || key === "models" ? [] : key === "products" ? [] : []);
  backendApiCache[key] = { data, expiresAt: now + BACKEND_API_CACHE_TTL_MS };
  return data as T;
}

function formatModelLine(m: ModelItem): string {
  const name = m.name ?? "Unknown";
  const productName = m.product?.name;
  const brandName = m.product?.brand?.name;
  const label = [productName, brandName].filter(Boolean).join(" / ") || "—";
  const price = m.price != null ? `$${Number(m.price).toFixed(2)}` : "";
  return `${name} (${label})${price ? ` – ${price}` : ""}`;
}

async function fetchStoreContext(): Promise<string> {
  const now = Date.now();
  if (storeContextCache && storeContextCache.expiresAt > now) {
    return storeContextCache.value;
  }

  const base = getBackendUrl();
  try {
    const [categories, models, products, brands] = await Promise.all([
      getCachedBackendApi<CategoryShape[]>("categories", `${base}/api/categories`),
      getCachedBackendApi<ModelItem[]>("models", `${base}/api/models`),
      getCachedBackendApi<{ id?: string; name?: string }[]>("products", `${base}/api/products`),
      getCachedBackendApi<{ id?: string; name?: string }[]>("brands", `${base}/api/brands`),
    ]);

    const categoryList: CategoryShape[] = Array.isArray(categories) ? categories : [];
    const categoryNames = categoryList.map((c) => c.name).filter(Boolean);

    const deals = models.filter((m) => m.is_deal === true).slice(0, MAX_DEALS);
    const clearance = models.filter((m) => m.is_clearance === true).slice(0, MAX_CLEARANCE);
    const featured = models.filter((m) => m.is_featured === true).slice(0, MAX_FEATURED);
    const newArrivals = models.filter((m) => m.is_new === true).slice(0, MAX_NEW);
    const bestSellers = models.filter((m) => m.is_best_seller === true).slice(0, MAX_BEST_SELLERS);

    let context = "";

    context += "Store / brand context (Elite Vapor Boise):\n";
    context += "- Business: Elite Vapor (Elite Vapor Boise). Website: " + SITE_BASE_URL + ".\n";
    context += "- Tagline: Premium vaping products and accessories with a focus on quality and service. Quality you can trust.\n";
    context += "- About: We are dedicated to offering quality vaping products and accessories. We focus on reliability, variety, and customer satisfaction. We offer a wide selection—from disposables to devices and e-liquids—across categories. We choose products we trust so customers can shop with confidence. Questions? We're here to help; direct users to our Contact page.\n";
    context += "- Contact: Customers can reach us via the contact form at " + SITE_BASE_URL + "/contact (name, email, subject, message), or by email at info@elitevaporboise.com. We aim to respond within one business day.\n";
    context += "- Newsletter: Users can sign up on the site for updates on new arrivals, limited-time deals, and clearance drops from Elite Vapor.\n";
    context += "- Social: We have a “Follow Us” presence for new arrivals and offers (e.g. Facebook, Instagram); encourage users to follow for updates.\n\n";

    context += "Site navigation (give users these exact links when they ask how to find a page):\n";
    context += `- Contact form: ${SITE_BASE_URL}/contact\n`;
    context += `- About page: ${SITE_BASE_URL}/about\n`;
    context += `- All products: ${SITE_BASE_URL}/products\n`;
    context += `- Deals: ${SITE_BASE_URL}/products/deals\n`;
    context += `- Clearance: ${SITE_BASE_URL}/products/clearance\n`;
    context += `- Featured: ${SITE_BASE_URL}/products/featured\n`;
    context += `- Best sellers: ${SITE_BASE_URL}/products/best-sellers\n`;
    context += `- New arrivals: ${SITE_BASE_URL}/products/new\n\n`;

    if (categoryList.length > 0) {
      context += "Categories (use these links when users ask for a specific category like accessories):\n";
      for (const c of categoryList) {
        if (c.name && c.id) {
          context += `- ${c.name}: ${SITE_BASE_URL}/category/${c.id}\n`;
        }
      }
      context += "\n";
    }
    if (categoryNames.length > 0) {
      context += `Category names (for reference): ${categoryNames.join(", ")}.\n\n`;
    }

    const brandList = Array.isArray(brands) ? brands.map((b) => b.name).filter(Boolean) : [];
    const productNamesList = Array.isArray(products) ? products.map((p) => p.name).filter(Boolean) : [];
    if (brandList.length > 0) {
      context += `Brands: ${brandList.join(", ")}.\n\n`;
    }
    if (productNamesList.length > 0) {
      context += `Products (names): ${productNamesList.slice(0, 60).join("; ")}${productNamesList.length > 60 ? "…" : ""}.\n\n`;
    }

    if (deals.length > 0) {
      context += "Deals (on sale):\n";
      context += deals
        .map(
          (m) =>
            `${formatModelLine(m)} – ${m.deal_text ?? "On Sale"}`
        )
        .join("\n");
      context += "\n\n";
    } else {
      context += "Deals (on sale): None currently.\n\n";
    }

    if (clearance.length > 0) {
      context += "Clearance:\n";
      context += clearance.map(formatModelLine).join("\n");
      context += "\n\n";
    } else {
      context += "Clearance: None currently.\n\n";
    }

    if (featured.length > 0) {
      context += "Featured:\n";
      context += featured.map(formatModelLine).join("\n");
      context += "\n\n";
    }
    if (newArrivals.length > 0) {
      context += "New arrivals:\n";
      context += newArrivals.map(formatModelLine).join("\n");
      context += "\n\n";
    }
    if (bestSellers.length > 0) {
      context += "Best sellers:\n";
      context += bestSellers.map(formatModelLine).join("\n");
      context += "\n\n";
    }

    const productList = models.map(
      (m) =>
        `${m.name ?? "Unknown"}${m.product?.name ? ` (${m.product.name})` : ""}${m.product?.brand?.name ? ` – ${m.product.brand.name}` : ""}`
    );
    if (productList.length > 0) {
      context += `Products and models (name, product, brand): ${productList.slice(0, MAX_PRODUCTS_SUMMARY).join("; ")}${productList.length > MAX_PRODUCTS_SUMMARY ? "…" : ""}.`;
    }

    storeContextCache = { value: context, expiresAt: now + STORE_CONTEXT_TTL_MS };
    return context;
  } catch {
    return (
      "Store / brand: Elite Vapor Boise (" +
      SITE_BASE_URL +
      ") – premium vaping products and accessories. Contact: " +
      SITE_BASE_URL +
      "/contact or info@elitevaporboise.com. About: " +
      SITE_BASE_URL +
      "/about. Product and category data could not be loaded."
    );
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const storeContext = await fetchStoreContext();

  const systemPrompt = `You are the Elite Vapor store assistant for Elite Vapor Boise (${SITE_BASE_URL}). You help with: (1) Our store and brand—what Elite Vapor is, our focus on quality vaping products and accessories, how to contact us, our About page, newsletter signup, and social follow. (2) Products, categories, sales, deals, clearance, featured items, new arrivals, and best sellers. (3) Site navigation—contact form, about page, product pages, deals, and category pages (e.g. accessories). When users ask where to find something, give the exact URL from the store context (e.g. contact: ${SITE_BASE_URL}/contact, about: ${SITE_BASE_URL}/about, products: ${SITE_BASE_URL}/products, deals: ${SITE_BASE_URL}/products/deals). For a specific category, use the category link under "Categories" in the context. Be friendly and concise. Use only the store context below; do not make up products or prices. If asked about something unrelated, politely steer back to how you can help with our store.

When you cannot provide the requested information (e.g. it is not in the store context, you are unsure, or the question is outside what you can answer), respond with exactly this: "I am unable to provide that information at the moment. Please contact us at info@elitevaporboise.com or visit ${SITE_BASE_URL}/contact and we'll get back to you soon."

Current store context (use this to answer accurately):
${storeContext}`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
