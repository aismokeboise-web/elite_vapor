"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandsWriteRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
/** Serialize brand for API (ensure createdAt/updatedAt are included) */
function toBrandResponse(b) {
    return {
        id: b.id,
        name: b.name,
        categoryId: b.categoryId,
        createdAt: b.createdAt ?? null,
        updatedAt: b.updatedAt ?? null,
    };
}
/** Read-only (GET) routes for /api/brands */
const brandsReadRouter = (0, express_1.Router)();
brandsReadRouter.get("/", async (_req, res) => {
    try {
        const brands = await prisma_1.default.brand.findMany();
        res.json(brands.map(toBrandResponse));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch brands" });
    }
});
exports.default = brandsReadRouter;
/** Write (POST, PATCH, DELETE) routes for /api/admin/brands */
exports.brandsWriteRouter = (0, express_1.Router)();
exports.brandsWriteRouter.post("/", async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const brand = await prisma_1.default.brand.create({
            data: { name, categoryId: categoryId },
        });
        res.status(201).json(toBrandResponse(brand));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create brand" });
    }
});
exports.brandsWriteRouter.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, categoryId } = req.body;
        const brand = await prisma_1.default.brand.update({
            where: { id },
            data: { name, categoryId: categoryId !== undefined ? categoryId || null : undefined },
        });
        res.json(toBrandResponse(brand));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update brand" });
    }
});
exports.brandsWriteRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.brand.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete brand" });
    }
});
