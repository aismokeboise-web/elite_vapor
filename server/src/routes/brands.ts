import { Router, Request, Response } from "express";
import prisma from "../prisma";

/** Serialize brand for API (ensure createdAt/updatedAt are included) */
function toBrandResponse(b: { id: string; name: string; categoryId: string | null; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: b.id,
    name: b.name,
    categoryId: b.categoryId,
    createdAt: b.createdAt ?? null,
    updatedAt: b.updatedAt ?? null,
  };
}

/** Read-only (GET) routes for /api/brands */
const brandsReadRouter = Router();

brandsReadRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands.map(toBrandResponse));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

export default brandsReadRouter;

/** Write (POST, PATCH, DELETE) routes for /api/admin/brands */
export const brandsWriteRouter = Router();

brandsWriteRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;
    const brand = await prisma.brand.create({
      data: { name, categoryId: categoryId },
    });
    res.status(201).json(toBrandResponse(brand));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create brand" });
  }
});

brandsWriteRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, categoryId } = req.body;
    const brand = await prisma.brand.update({
      where: { id },
      data: { name, categoryId: categoryId !== undefined ? categoryId || null : undefined },
    });
    res.json(toBrandResponse(brand));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update brand" });
  }
});

brandsWriteRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.brand.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete brand" });
  }
});
