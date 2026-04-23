import type { Metadata } from "next";
import { ProductDetailClient } from "./ProductDetailClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("not found");
    const product = await res.json();
    const title = `${product.name} - Elite Vapor Vape and Smoke - Boise Idaho`;
    const categoryName = product.brand?.category?.name || "Vape";
    return {
      title,
      description: `Buy ${product.name} at Elite Vapor Vape and Smoke in Boise, ID. ${categoryName} products at competitive prices.`,
      openGraph: { title, description: `${product.name} — available at Elite Vapor in Boise, Idaho.` },
    };
  } catch {
    return {
      title: "Product - Elite Vapor Vape and Smoke - Boise Idaho",
      description: "Premium vape products at Elite Vapor in Boise, ID.",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
