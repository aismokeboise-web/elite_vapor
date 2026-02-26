"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductsReadRouter = createProductsReadRouter;
exports.createProductsWriteRouter = createProductsWriteRouter;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
/** Serialize a model for API response (client expects price as number or string) */
function serializeModel(m) {
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
function toProductResponse(p, models) {
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
function createProductsReadRouter() {
    const router = (0, express_1.Router)();
    /** GET /api/products - list all products with models (for client) */
    router.get("/", async (_req, res) => {
        try {
            const products = await prisma_1.default.product.findMany({
                include: { brand: { include: { category: true } } },
            });
            const modelIds = [...new Set(products.flatMap((p) => p.modelIds))].filter(Boolean);
            const models = modelIds.length > 0
                ? await prisma_1.default.model.findMany({ where: { id: { in: modelIds } } })
                : [];
            const modelMap = new Map(models.map((m) => [m.id, m]));
            const productsWithModels = products.map((p) => toProductResponse(p, p.modelIds.map((id) => modelMap.get(id)).filter((m) => m != null)));
            res.json(productsWithModels);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch products" });
        }
    });
    /** GET /api/products/:id - get single product with models (for client) */
    router.get("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const product = await prisma_1.default.product.findUnique({
                where: { id },
                include: { brand: { include: { category: true } } },
            });
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            const models = product.modelIds.length > 0
                ? await prisma_1.default.model.findMany({
                    where: { id: { in: product.modelIds } },
                })
                : [];
            const orderedModels = product.modelIds.map((mid) => models.find((m) => m.id === mid)).filter((m) => m != null);
            res.json(toProductResponse(product, orderedModels));
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch product" });
        }
    });
    return router;
}
/** Write (POST, PATCH, DELETE) routes for /api/admin/products */
function createProductsWriteRouter(upload) {
    const router = (0, express_1.Router)();
    router.post("/", async (req, res) => {
        try {
            const { name, size, nicotineStrength, brandId, modelIds: modelIdsRaw, } = req.body;
            const modelIds = Array.isArray(modelIdsRaw)
                ? modelIdsRaw.map((v) => String(v).trim()).filter(Boolean)
                : typeof modelIdsRaw === "string"
                    ? modelIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
            const product = await prisma_1.default.product.create({
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create product" });
        }
    });
    router.post("/upload", upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
    ]), async (req, res) => {
        try {
            const files = req.files;
            const imageUrls = [];
            if (files?.image1?.[0])
                imageUrls.push("/uploads/" + files.image1[0].filename);
            if (files?.image2?.[0])
                imageUrls.push("/uploads/" + files.image2[0].filename);
            if (files?.image3?.[0])
                imageUrls.push("/uploads/" + files.image3[0].filename);
            const b = req.body;
            const modelIdsRaw = b.modelIds;
            const modelIds = typeof modelIdsRaw === "string"
                ? modelIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            const product = await prisma_1.default.product.create({
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create product" });
        }
    });
    router.patch("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const { name, size, nicotineStrength, brandId, modelIds: modelIdsRaw, } = req.body;
            const modelIds = modelIdsRaw === undefined
                ? undefined
                : Array.isArray(modelIdsRaw)
                    ? modelIdsRaw.map((v) => String(v).trim()).filter(Boolean)
                    : typeof modelIdsRaw === "string"
                        ? modelIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
            const product = await prisma_1.default.product.update({
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update product" });
        }
    });
    router.delete("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            await prisma_1.default.product.delete({ where: { id } });
            res.status(204).send();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to delete product" });
        }
    });
    return router;
}
