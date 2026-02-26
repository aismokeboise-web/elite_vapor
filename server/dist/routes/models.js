"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelsWriteRouter = createModelsWriteRouter;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
/** Serialize model for API (ensure createdAt/updatedAt are included; price as number) */
function toModelResponse(m) {
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
        createdAt: m.createdAt ?? null,
        updatedAt: m.updatedAt ?? null,
    };
}
/** Read-only (GET) routes for /api/models */
const modelsReadRouter = (0, express_1.Router)();
modelsReadRouter.get("/", async (_req, res) => {
    try {
        const models = await prisma_1.default.model.findMany();
        res.json(models.map(toModelResponse));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch models" });
    }
});
modelsReadRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const model = await prisma_1.default.model.findUnique({ where: { id } });
        if (!model) {
            return res.status(404).json({ error: "Model not found" });
        }
        res.json(toModelResponse(model));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch model" });
    }
});
exports.default = modelsReadRouter;
/** Write (POST, PATCH, DELETE) routes for /api/admin/models. Accepts model image upload middleware (single file, 50KB max). */
function createModelsWriteRouter(modelImageUpload) {
    const router = (0, express_1.Router)();
    /** POST /upload-image – upload a single model image (max 50KB). Returns { url: "/uploads/filename" }. */
    router.post("/upload-image", (req, res, next) => {
        modelImageUpload.single("image")(req, res, (err) => {
            if (err) {
                const message = err && typeof err.code === "string" && err.code === "LIMIT_FILE_SIZE"
                    ? "Image must be under 50KB."
                    : err instanceof Error ? err.message : "Upload failed.";
                return res.status(400).json({ error: message });
            }
            next();
        });
    }, (req, res) => {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No image file provided." });
        }
        res.status(201).json({ url: "/uploads/" + file.filename });
    });
    router.post("/", async (req, res) => {
        try {
            const { name, price, description, flavors: flavorsRaw, is_clearance, is_deal, is_best_seller, is_new, imageUrls: imageUrlsRaw, } = req.body;
            const deal_text = req.body.deal_text;
            const flavors = flavorsRaw == null
                ? []
                : Array.isArray(flavorsRaw)
                    ? flavorsRaw.map((v) => String(v).trim()).filter(Boolean)
                    : typeof flavorsRaw === "string"
                        ? flavorsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
            const imageUrls = imageUrlsRaw == null
                ? []
                : Array.isArray(imageUrlsRaw)
                    ? imageUrlsRaw.map((v) => String(v).trim()).filter(Boolean)
                    : typeof imageUrlsRaw === "string"
                        ? imageUrlsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                        : [];
            const model = await prisma_1.default.model.create({
                data: {
                    name,
                    price: price != null ? Number(price) : null,
                    description: description ?? null,
                    flavors,
                    is_clearance: !!is_clearance,
                    is_deal: !!is_deal,
                    deal_text: deal_text != null && String(deal_text).trim() !== "" ? String(deal_text).trim() : null,
                    is_best_seller: !!is_best_seller,
                    is_new: !!is_new,
                    imageUrls,
                },
            });
            res.status(201).json(toModelResponse(model));
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create model" });
        }
    });
    router.patch("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const { name, price, description, flavors: flavorsRaw, is_clearance, is_deal, is_best_seller, is_new, imageUrls: imageUrlsRaw, } = req.body;
            const deal_text = req.body.deal_text;
            const data = {};
            if (name !== undefined)
                data.name = name;
            if (price !== undefined)
                data.price = price != null ? Number(price) : null;
            if (description !== undefined)
                data.description = description ?? null;
            if (flavorsRaw !== undefined) {
                data.flavors =
                    flavorsRaw == null
                        ? []
                        : Array.isArray(flavorsRaw)
                            ? flavorsRaw.map((v) => String(v).trim()).filter(Boolean)
                            : typeof flavorsRaw === "string"
                                ? flavorsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                                : [];
            }
            if (imageUrlsRaw !== undefined) {
                data.imageUrls =
                    imageUrlsRaw == null
                        ? []
                        : Array.isArray(imageUrlsRaw)
                            ? imageUrlsRaw.map((v) => String(v).trim()).filter(Boolean)
                            : typeof imageUrlsRaw === "string"
                                ? imageUrlsRaw.split(",").map((s) => s.trim()).filter(Boolean)
                                : [];
            }
            if (is_clearance !== undefined)
                data.is_clearance = !!is_clearance;
            if (is_deal !== undefined)
                data.is_deal = !!is_deal;
            if (deal_text !== undefined)
                data.deal_text = deal_text != null && String(deal_text).trim() !== "" ? String(deal_text).trim() : null;
            if (is_best_seller !== undefined)
                data.is_best_seller = !!is_best_seller;
            if (is_new !== undefined)
                data.is_new = !!is_new;
            const model = await prisma_1.default.model.update({
                where: { id },
                data,
            });
            res.json(toModelResponse(model));
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update model" });
        }
    });
    /** Delete model by id. Image files on disk are left intact (not deleted). */
    router.delete("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            await prisma_1.default.model.delete({ where: { id } });
            res.status(204).send();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to delete model" });
        }
    });
    return router;
}
