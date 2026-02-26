import { Router, Request, Response } from "express";
import type { Multer } from "multer";
import prisma from "../prisma";

/** Serialize a model for API response (client expects price as number or string) */
function serializeModel(m: {
  id: string;
  name: string;
  price: unknown;
  description: string | null;
  flavors: string[];
  is_clearance: boolean;
  is_deal: boolean;
  deal_text: string | null;
  is_best_seller: boolean;
  is_new: boolean;
  imageUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const price = m.price != null ? Number(m.price) : null;
  return {
    id: m.id,
    name: m.name,
    price: Number.isFinite(price) ? price : null,
    description: m.description,
    flavors: m.flavors ?? [],
    is_clearance: m.is_clearance ?? false,
    is_deal: m.is_deal ?? false,
    deal_text: m.deal_text ?? null,
    is_best_seller: m.is_best_seller ?? false,
    is_new: m.is_new ?? false,
    imageUrls: m.imageUrls ?? [],
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

/** Shape product response for client (ApiProductWithModels) */
function toProductResponse(p: {
  id: string;
  name: string;
  size: string | null;
  nicotineStrength: string | null;
  modelIds: string[];
  brandId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  brand: { id: string; name: string; categoryId: string | null; category: { id: string; name: string } | null } | null;
}, models: { id: string; name: string; price: unknown; description: string | null; flavors: string[]; is_clearance: boolean; is_deal: boolean; deal_text: string | null; is_best_seller: boolean; is_new: boolean; imageUrls: string[]; createdAt?: Date; updatedAt?: Date }[]) {
  return {
    id: p.id,
    name: p.name,
    size: p.size,
    nicotineStrength: p.nicotineStrength,
    modelIds: p.modelIds,
    brandId: p.brandId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    brand: p.brand ? {
      id: p.brand.id,
      name: p.brand.name,
      categoryId: p.brand.categoryId,
      category: p.brand.category ? { id: p.brand.category.id, name: p.brand.category.name } : null,
    } : null,
    models: models.map(serializeModel),
  };
}

/** Read-only (GET) routes for /api/products */
export function createProductsReadRouter(): Router {
  const router = Router();

  /** GET /api/products - list all products with models (for client) */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        include: { brand: { include: { category: true } } },
      });
      const modelIds = [...new Set(products.flatMap((p) => p.modelIds))].filter(Boolean);
      const models = modelIds.length > 0
        ? await prisma.model.findMany({ where: { id: { in: modelIds } } })
        : [];
      const modelMap = new Map(models.map((m) => [m.id, m]));
      const productsWithModels = products.map((p) =>
        toProductResponse(p, p.modelIds.map((id) => modelMap.get(id)).filter((m): m is NonNullable<typeof m> => m != null))
      );
      res.json(productsWithModels);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  /** GET /api/products/:id - get single product with models (for client) */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const product = await prisma.product.findUnique({
        where: { id },
        include: { brand: { include: { category: true } } },
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const models =
        product.modelIds.length > 0
          ? await prisma.model.findMany({
              where: { id: { in: product.modelIds } },
            })
          : [];
      const orderedModels = product.modelIds.map((mid) => models.find((m) => m.id === mid)).filter((m): m is NonNullable<typeof m> => m != null);
      res.json(toProductResponse(product, orderedModels));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  return router;
}

/** Write (POST, PATCH, DELETE) routes for /api/admin/products */
export function createProductsWriteRouter(upload: Multer): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const {
        name,
        size,
        nicotineStrength,
        brandId,
        modelIds: modelIdsRaw,
      } = req.body;

      const modelIds = Array.isArray(modelIdsRaw)
        ? modelIdsRaw.map((v: unknown) => String(v).trim()).filter(Boolean)
        : typeof modelIdsRaw === "string"
          ? modelIdsRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const product = await prisma.product.create({
        data: {
          name,
          size,
          nicotineStrength,
          brandId,
          modelIds,
        },
        include: { brand: true },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  router.post(
    "/upload",
    upload.fields([
      { name: "image1", maxCount: 1 },
      { name: "image2", maxCount: 1 },
      { name: "image3", maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        type FileArray = { filename: string }[];
        const files = (req as Request & {
          files?: { image1?: FileArray; image2?: FileArray; image3?: FileArray };
        }).files;
        const imageUrls: string[] = [];
        if (files?.image1?.[0]) imageUrls.push("/uploads/" + files.image1[0].filename);
        if (files?.image2?.[0]) imageUrls.push("/uploads/" + files.image2[0].filename);
        if (files?.image3?.[0]) imageUrls.push("/uploads/" + files.image3[0].filename);

        const b = req.body as Record<string, string>;
        const modelIdsRaw = b.modelIds;
        const modelIds =
          typeof modelIdsRaw === "string"
            ? modelIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
            : [];

        const product = await prisma.product.create({
          data: {
            name: b.name,
            size: b.size || null,
            nicotineStrength: b.nicotineStrength || null,
            brandId: b.brandId || null,
            modelIds,
          },
          include: { brand: true },
        });
        res.status(201).json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  );

  router.patch("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const {
        name,
        size,
        nicotineStrength,
        brandId,
        modelIds: modelIdsRaw,
      } = req.body;

      const modelIds =
        modelIdsRaw === undefined
          ? undefined
          : Array.isArray(modelIdsRaw)
            ? modelIdsRaw.map((v: unknown) => String(v).trim()).filter(Boolean)
            : typeof modelIdsRaw === "string"
              ? modelIdsRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [];

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          size,
          nicotineStrength,
          brandId,
          ...(modelIds !== undefined && { modelIds }),
        },
        include: { brand: true },
      });

      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await prisma.product.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  return router;
}
