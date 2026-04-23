import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";
import { categoryIconUpload } from "../uploads";

export const categoriesRouter = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function findCategoryByIdentifier(identifier: string) {
  // Try by id first, then by slug
  const byId = await prisma.category.findUnique({ where: { id: identifier } });
  if (byId) return byId;
  return prisma.category.findUnique({ where: { slug: identifier } });
}

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
  const category = await findCategoryByIdentifier(id);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  return res.json(category);
});

// Protected write endpoints
categoriesRouter.post(
  "/",
  authMiddleware,
  requirePrivilege("category", "create"),
  categoryIconUpload.single("icon"),
  async (req, res) => {
    const { name, slug: rawSlug } = req.body ?? {};

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const file = (req as typeof req & { file?: { filename?: string } }).file;
    const iconPath =
      file && file.filename
        ? `/uploads/category-icons/${file.filename}`
        : null;

    // Use provided slug, or auto-generate from name
    const slug = rawSlug?.trim() ? rawSlug.trim() : slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
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

    const { name, slug: rawSlug } = req.body ?? {};
    const file = (req as typeof req & { file?: { filename?: string } }).file;

    const newName = name ?? existing.name;
    // If slug explicitly provided, use it; if name changed and no slug, regenerate
    let newSlug = existing.slug;
    if (rawSlug?.trim()) {
      newSlug = rawSlug.trim();
    } else if (name && name !== existing.name && !existing.slug) {
      newSlug = slugify(name);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: newName,
        slug: newSlug,
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
