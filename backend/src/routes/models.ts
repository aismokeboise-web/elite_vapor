import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";
import { modelImagesUpload } from "../uploads";

export const modelsRouter = Router();

// Public read endpoints
modelsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const productId = typeof req.query.productId === "string" ? req.query.productId.trim() : "";
  const brandId = typeof req.query.brandId === "string" ? req.query.brandId.trim() : "";
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId.trim() : "";
  const priceMin = req.query.priceMin != null ? Number(req.query.priceMin) : NaN;
  const priceMax = req.query.priceMax != null ? Number(req.query.priceMax) : NaN;
  const size = typeof req.query.size === "string" ? req.query.size.trim() : "";
  const nicotineStrength = typeof req.query.nicotineStrength === "string" ? req.query.nicotineStrength.trim() : "";
  const is_clearance = req.query.is_clearance === "1" || req.query.is_clearance === "true";
  const is_deal = req.query.is_deal === "1" || req.query.is_deal === "true";
  const is_best_seller = req.query.is_best_seller === "1" || req.query.is_best_seller === "true";
  const is_new = req.query.is_new === "1" || req.query.is_new === "true";
  const is_featured = req.query.is_featured === "1" || req.query.is_featured === "true";

  const where: {
    name?: { contains: string; mode: "insensitive" };
    productId?: string;
    price?: { gte?: number; lte?: number };
    is_clearance?: boolean;
    is_deal?: boolean;
    is_best_seller?: boolean;
    is_new?: boolean;
    is_featured?: boolean;
    product?: { brandId?: string; brand?: { categoryId: string }; size?: string; nicotineStrength?: string };
  } = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (productId) where.productId = productId;
  if (is_clearance) where.is_clearance = true;
  if (is_deal) where.is_deal = true;
  if (is_best_seller) where.is_best_seller = true;
  if (is_new) where.is_new = true;
  if (is_featured) where.is_featured = true;
  if (!Number.isNaN(priceMin) || !Number.isNaN(priceMax)) {
    where.price = {};
    if (!Number.isNaN(priceMin)) (where.price as { gte?: number }).gte = priceMin;
    if (!Number.isNaN(priceMax)) (where.price as { lte?: number }).lte = priceMax;
  }
  if (brandId || categoryId || size || nicotineStrength) {
    const productWhere: {
      brandId?: string;
      brand?: { categoryId: string };
      size?: string;
      nicotineStrength?: string;
    } = {};
    if (brandId) productWhere.brandId = brandId;
    if (categoryId) productWhere.brand = { categoryId };
    if (size) productWhere.size = size;
    if (nicotineStrength) productWhere.nicotineStrength = nicotineStrength;
    where.product = productWhere;
  }

  const models = await prisma.model.findMany({
    where,
    include: {
      product: {
        select: {
          name: true,
          brand: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return res.json(models);
});

modelsRouter.get("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          name: true,
          brand: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  if (!model) {
    return res.status(404).json({ error: "Model not found" });
  }
  return res.json(model);
});

// Protected write endpoints (admin / subadmin with privileges)
modelsRouter.post(
  "/",
  authMiddleware,
  requirePrivilege("model", "create"),
  modelImagesUpload,
  async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const files = (req as typeof req & {
      files?: { image1?: Express.Multer.File[]; image2?: Express.Multer.File[]; image3?: Express.Multer.File[] };
    }).files;

    const imageUrls: string[] = [];
    if (files) {
      for (const key of ["image1", "image2", "image3"] as const) {
        const arr = files[key];
        if (Array.isArray(arr) && arr[0]?.filename) {
          imageUrls.push(`/uploads/model-images/${arr[0].filename}`);
        }
      }
    }

    const { name, productId, price, description, flavors } = body ?? {};

    if (!name || !productId || price === undefined) {
      return res
        .status(400)
        .json({ error: "name, productId and price are required" });
    }

    const model = await prisma.model.create({
      data: {
        name: String(name),
        productId: String(productId),
        price: Number(price),
        description: description != null && String(description).trim() !== "" ? String(description).trim() : null,
        flavors: Array.isArray(flavors)
          ? (flavors as string[]).map((f: string) => String(f).trim())
          : typeof flavors === "string" && String(flavors).trim().length > 0
          ? String(flavors)
              .split(",")
              .map((f: string) => f.trim())
          : [],
        is_clearance: body.is_clearance === "1" || body.is_clearance === true,
        is_deal: body.is_deal === "1" || body.is_deal === true,
        is_best_seller: body.is_best_seller === "1" || body.is_best_seller === true,
        is_new: body.is_new === "1" || body.is_new === true,
        is_featured: body.is_featured === "1" || body.is_featured === true,
        imageUrls,
      },
    });

    return res.status(201).json(model);
  }
);

modelsRouter.put(
  "/:id",
  authMiddleware,
  requirePrivilege("model", "update"),
  modelImagesUpload,
  async (req, res) => {
    const { id } = req.params as { id: string };

    const existing = await prisma.model.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Model not found" });
    }

    const body = req.body as Record<string, unknown>;
    const files = (req as typeof req & {
      files?: { image1?: Express.Multer.File[]; image2?: Express.Multer.File[]; image3?: Express.Multer.File[] };
    }).files;

    let imageUrls: string[] = existing.imageUrls;
    if (files) {
      const next: string[] = [];
      for (let i = 0; i < 3; i++) {
        const key = (["image1", "image2", "image3"] as const)[i];
        const arr = files[key];
        if (Array.isArray(arr) && arr[0]?.filename) {
          next.push(`/uploads/model-images/${arr[0].filename}`);
        } else if (existing.imageUrls[i]) {
          next.push(existing.imageUrls[i]);
        }
      }
      if (next.length > 0) imageUrls = next;
    }

    const { name, productId, price, description, flavors, deal_text } = body ?? {};

    const updated = await prisma.model.update({
      where: { id },
      data: {
        name: name != null ? String(name) : existing.name,
        productId: productId != null ? String(productId) : existing.productId,
        price: price != null ? Number(price) : existing.price,
        description:
          description !== undefined
            ? (description == null || String(description).trim() === "" ? null : String(description).trim())
            : existing.description,
        flavors:
          flavors === undefined
            ? existing.flavors
            : Array.isArray(flavors)
            ? (flavors as string[]).map((f: string) => String(f).trim())
            : typeof flavors === "string" && String(flavors).trim().length > 0
            ? String(flavors)
                .split(",")
                .map((f: string) => f.trim())
            : existing.flavors,
        is_clearance:
          body.is_clearance !== undefined
            ? (body.is_clearance === "1" || body.is_clearance === true)
            : existing.is_clearance,
        is_deal:
          body.is_deal !== undefined
            ? (body.is_deal === "1" || body.is_deal === true)
            : existing.is_deal,
        deal_text:
          deal_text !== undefined
            ? (deal_text == null || String(deal_text).trim() === "" ? "On Sale" : String(deal_text).trim())
            : existing.deal_text,
        is_best_seller:
          body.is_best_seller !== undefined
            ? (body.is_best_seller === "1" || body.is_best_seller === true)
            : existing.is_best_seller,
        is_new:
          body.is_new !== undefined
            ? (body.is_new === "1" || body.is_new === true)
            : existing.is_new,
        is_featured:
          body.is_featured !== undefined
            ? (body.is_featured === "1" || body.is_featured === true)
            : existing.is_featured,
        imageUrls,
      },
    });

    return res.json(updated);
  }
);

modelsRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("model", "delete"),
  async (req, res) => {
    const { id } = req.params as { id: string };

    const existing = await prisma.model.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Model not found" });
    }

    await prisma.model.delete({ where: { id } });
    return res.status(204).send();
  }
);

