"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesWriteRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
/** Serialize category for API (ensure createdAt/updatedAt are included) */
function toCategoryResponse(c) {
    return {
        id: c.id,
        name: c.name,
        createdAt: c.createdAt ?? null,
        updatedAt: c.updatedAt ?? null,
    };
}
/** Read-only (GET) routes for /api/categories */
const categoriesReadRouter = (0, express_1.Router)();
categoriesReadRouter.get("/", async (_req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany();
        res.json(categories.map(toCategoryResponse));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
categoriesReadRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const category = await prisma_1.default.category.findUnique({ where: { id } });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(toCategoryResponse(category));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch category" });
    }
});
exports.default = categoriesReadRouter;
/** Write (POST, PATCH, DELETE) routes for /api/admin/categories */
exports.categoriesWriteRouter = (0, express_1.Router)();
exports.categoriesWriteRouter.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma_1.default.category.create({
            data: { name },
        });
        res.status(201).json(toCategoryResponse(category));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create category" });
    }
});
exports.categoriesWriteRouter.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        const category = await prisma_1.default.category.update({
            where: { id },
            data: { name },
        });
        res.json(toCategoryResponse(category));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update category" });
    }
});
exports.categoriesWriteRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.category.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete category" });
    }
});
