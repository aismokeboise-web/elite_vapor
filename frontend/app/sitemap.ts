import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elitevaporboise.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function fetchJson<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    fetchJson<{ id: string; slug?: string | null; updatedAt?: string }>(
      "/api/categories"
    ),
    fetchJson<{ id: string; slug?: string | null; updatedAt?: string }>(
      "/api/products"
    ),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/products/featured`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/products/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/products/best-sellers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/products/new`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/products/clearance`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug || c.id}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug || p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
