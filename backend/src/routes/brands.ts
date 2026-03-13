import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";

export const brandsRouter = Router();

// Public read endpoints
brandsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId.trim() : "";
  const where: { name?: { contains: string; mode: "insensitive" }; categoryId?: string } = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  const brands = await prisma.brand.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return res.json(brands);
});

brandsRouter.get("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!brand) {
    return res.status(404).json({ error: "Brand not found" });
  }
  return res.json(brand);
});

// Protected write endpoints
brandsRouter.post(
  "/",
  authMiddleware,
  requirePrivilege("brand", "create"),
  async (req, res) => {
    const { name, categoryId } = req.body ?? {};

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ error: "name and categoryId are required" });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        categoryId,
      },
    });

    return res.status(201).json(brand);
  }
);

brandsRouter.put(
  "/:id",
  authMiddleware,
  requirePrivilege("brand", "update"),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const { name, categoryId } = req.body ?? {};

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        categoryId: categoryId ?? existing.categoryId,
      },
    });

    return res.json(updated);
  }
);

brandsRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("brand", "delete"),
  async (req, res) => {
    const { id } = req.params as { id: string };

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Brand not found" });
    }

    await prisma.brand.delete({ where: { id } });
    return res.status(204).send();
  }
);

