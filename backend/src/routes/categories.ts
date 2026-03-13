import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";
import { categoryIconUpload } from "../uploads";

export const categoriesRouter = Router();

// Public read endpoints
categoriesRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};
  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return res.json(categories);
});

categoriesRouter.get("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  return res.json(category);
});

// Protected write endpoints (admin / subadmin with privileges)
categoriesRouter.post(
  "/",
  authMiddleware,
  requirePrivilege("category", "create"),
  categoryIconUpload.single("icon"),
  async (req, res) => {
    const { name } = req.body ?? {};

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const file = (req as typeof req & { file?: { filename?: string } }).file;
    const iconPath =
      file && file.filename
        ? `/uploads/category-icons/${file.filename}`
        : null;

    const category = await prisma.category.create({
      data: {
        name,
        iconPath,
      },
    });

    return res.status(201).json(category);
  }
);

categoriesRouter.put(
  "/:id",
  authMiddleware,
  requirePrivilege("category", "update"),
  categoryIconUpload.single("icon"),
  async (req, res) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    const { name } = req.body ?? {};
    const file = (req as typeof req & { file?: { filename?: string } }).file;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        iconPath:
          file && file.filename
            ? `/uploads/category-icons/${file.filename}`
            : existing.iconPath,
      },
    });

    return res.json(updated);
  }
);

categoriesRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("category", "delete"),
  async (req, res) => {
    const { id } = req.params as { id: string };

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(204).send();
  }
);

