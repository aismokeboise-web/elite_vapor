import type { Metadata } from "next";
import { CategoryClient } from "./CategoryClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("not found");
    const category = await res.json();
    const title = `${category.name} - Elite Vapor Vape and Smoke - Boise Idaho`;
    return {
      title,
      description: `Shop ${category.name} products at Elite Vapor Vape and Smoke in Boise, ID. Premium quality at competitive prices.`,
      openGraph: { title, description: `${category.name} — Elite Vapor in Boise, Idaho.` },
    };
  } catch {
    return {
      title: "Category - Elite Vapor Vape and Smoke - Boise Idaho",
      description: "Browse vape products by category at Elite Vapor in Boise, ID.",
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  return <CategoryClient id={id} />;
}
