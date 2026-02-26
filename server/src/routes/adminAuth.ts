import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { API_ROUTES } from "../apiRoutes";

const router = Router();

const TWO_HOURS_SECONDS = 2 * 60 * 60;
const TWO_HOURS_MS = TWO_HOURS_SECONDS * 1000;

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || "dev-admin-secret-change-me";
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = (req.body ?? {}) as {
      username?: string;
      email?: string;
      password?: string;
    };

    const identifier = (username ?? "").trim() || (email ?? "").trim();

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Username or email and password are required." });
    }

    // We treat the stored username and email as valid identifiers for login.
    // This allows logging in with either the username or the email value.
    const admin = await (prisma as any).admin.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
    });

    if (!admin || !admin.password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username/email or password." });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username/email or password." });
    }

    const secret = getJwtSecret();
    const expiresAt = Date.now() + TWO_HOURS_MS;
    const token = jwt.sign(
      {
        sub: admin.username,
        type: "admin",
      },
      secret,
      { expiresIn: TWO_HOURS_SECONDS }
    );

    return res.json({ success: true, token, expiresAt });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to login." });
  }
});

/** GET /api/admin/messages – admin only, returns JSON */
router.get("/messages", async (_req: Request, res: Response) => {
  try {
    const messages = await (prisma as any).message.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load messages." });
  }
});

/** GET /api/admin/newsletter-subscriptions – admin only, returns JSON */
router.get("/newsletter-subscriptions", async (_req: Request, res: Response) => {
  try {
    const subs = await (prisma as any).newsletterSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(subs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load newsletter subscriptions." });
  }
});

/** DELETE /api/admin/newsletter-subscriptions/:id – admin only, remove a subscription */
router.delete("/newsletter-subscriptions/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid subscription id." });
    }
    await (prisma as any).newsletterSubscription.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Subscription not found." });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to delete newsletter subscription." });
  }
});

/** DELETE /api/admin/messages/:id – admin only, delete a contact message */
router.delete("/messages/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid message id." });
    }
    await (prisma as any).message.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Message not found." });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to delete message." });
  }
});

/** GET /api/admin/apis – admin only, returns metadata for all API routes (including this one) */
router.get("/apis", async (_req: Request, res: Response) => {
  return res.json(API_ROUTES);
});

export default router;

