import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";

export const productsRouter = Router();

// Public read endpoints
productsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const brandId = typeof req.query.brandId === "string" ? req.query.brandId.trim() : "";
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId.trim() : "";
  const size = typeof req.query.size === "string" ? req.query.size.trim() : "";
  const nicotineStrength = typeof req.query.nicotineStrength === "string" ? req.query.nicotineStrength.trim() : "";
  const is_clearance = req.query.is_clearance === "true" || req.query.is_clearance === "1";
  const is_deal = req.query.is_deal === "true" || req.query.is_deal === "1";
  const is_best_seller = req.query.is_best_seller === "true" || req.query.is_best_seller === "1";
  const is_new = req.query.is_new === "true" || req.query.is_new === "1";
  const is_featured = req.query.is_featured === "true" || req.query.is_featured === "1";
  const shop = req.query.shop === "true" || req.query.shop === "1";

  const where: {
    name?: { contains: string; mode: "insensitive" };
    brandId?: string;
    size?: string;
    nicotineStrength?: string;
    brand?: { categoryId: string };
    models?: { some: Record<string, boolean> | { OR: Record<string, boolean>[] } };
  } = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (brandId) where.brandId = brandId;
  if (categoryId) where.brand = { categoryId };
  if (size) where.size = size;
  if (nicotineStrength) where.nicotineStrength = nicotineStrength;
  if (shop) {
    where.models = {
      some: {
        OR: [
          { is_clearance: true },
          { is_deal: true },
          { is_best_seller: true },
          { is_new: true },
        ],
      },
    };
  } else {
    if (is_clearance) where.models = { some: { is_clearance: true } };
    if (is_deal) where.models = { some: { is_deal: true } };
    if (is_best_seller) where.models = { some: { is_best_seller: true } };
    if (is_new) where.models = { some: { is_new: true } };
    if (is_featured) where.models = { some: { is_featured: true } };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: {
        include: { category: true },
      },
      models: true,
    },
    orderBy: { name: "asc" },
  });
  return res.json(products);
});

// Dedicated endpoint for featured products
productsRouter.get("/featured", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: {
      models: {
        some: {
          is_featured: true,
        },
      },
    },
    include: {
      brand: {
        include: { category: true },
      },
      models: true,
    },
    orderBy: { name: "asc" },
  });
  return res.json(products);
});

productsRouter.get("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: {
        include: { category: true },
      },
      models: true,
    },
  });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  return res.json(product);
});

// Protected write endpoints
productsRouter.post(
  "/",
  authMiddleware,
  requirePrivilege("product", "create"),
  async (req, res) => {
    const { name, brandId, size, nicotineStrength } = req.body ?? {};

    if (!name || !brandId) {
      return res
        .status(400)
        .json({ error: "name and brandId are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brandId,
        size: size ?? null,
        nicotineStrength: nicotineStrength ?? null,
      },
    });

    return res.status(201).json(product);
  }
);

productsRouter.put(
  "/:id",
  authMiddleware,
  requirePrivilege("product", "update"),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, brandId, size, nicotineStrength } = req.body ?? {};

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        brandId: brandId ?? existing.brandId,
        size: size ?? existing.size,
        nicotineStrength: nicotineStrength ?? existing.nicotineStrength,
      },
    });

    return res.json(updated);
  }
);

productsRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("product", "delete"),
  async (req, res) => {
    const { id } = req.params as { id: string };

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(204).send();
  }
);

