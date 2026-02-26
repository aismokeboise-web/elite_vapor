import { Router, Request, Response } from "express";
import prisma from "../prisma";

/** Serialize category for API (ensure createdAt/updatedAt are included) */
function toCategoryResponse(c: { id: string; name: string; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: c.id,
    name: c.name,
    createdAt: c.createdAt ?? null,
    updatedAt: c.updatedAt ?? null,
  };
}

/** Read-only (GET) routes for /api/categories */
const categoriesReadRouter = Router();

categoriesReadRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories.map(toCategoryResponse));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

categoriesReadRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(toCategoryResponse(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

export default categoriesReadRouter;

/** Write (POST, PATCH, DELETE) routes for /api/admin/categories */
export const categoriesWriteRouter = Router();

categoriesWriteRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(toCategoryResponse(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

categoriesWriteRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res.json(toCategoryResponse(category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

categoriesWriteRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});
