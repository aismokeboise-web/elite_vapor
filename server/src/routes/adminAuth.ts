import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { API_ROUTES } from "../apiRoutes";
import {
  sendAdminPasswordChangedEmail,
  sendAdminPasswordResetEmail,
} from "../email/mailer";

const router = Router();

const TWO_HOURS_SECONDS = 2 * 60 * 60;
const TWO_HOURS_MS = TWO_HOURS_SECONDS * 1000;
const RESET_TOKEN_EXP_SECONDS = 5 * 60;

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || "dev-admin-secret-change-me";
}

function getResetJwtSecret() {
  return process.env.ADMIN_RESET_JWT_SECRET || getJwtSecret();
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

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { identifier } = (req.body ?? {}) as { identifier?: string };
    const trimmed = (identifier ?? "").trim();

    if (!trimmed) {
      return res.status(400).json({ success: false, error: "Identifier is required." });
    }

    const admin = await (prisma as any).admin.findFirst({
      where: {
        OR: [{ username: trimmed }, { email: trimmed }],
      },
    });

    if (admin && admin.email) {
      const secret = getResetJwtSecret();
      const token = jwt.sign(
        {
          sub: admin.username,
          type: "admin-reset",
        },
        secret,
        { expiresIn: RESET_TOKEN_EXP_SECONDS }
      );

      const rawBase = process.env.ADMIN_BASE_URL || process.env.APP_BASE_URL || "";
      const base = rawBase || "http://localhost:5173";
      const normalizedBase = base.replace(/\/+$/, "");
      const resetUrl = `${normalizedBase}/admin/reset-password?token=${encodeURIComponent(token)}`;

      try {
        await sendAdminPasswordResetEmail(admin.email, resetUrl);
      } catch (emailError) {
        // eslint-disable-next-line no-console
        console.error("[admin forgot-password] Failed to send reset email", emailError);
      }
    }

    // Always respond with success to avoid leaking whether the admin exists.
    return res.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to process password reset request." });
  }
});

router.post("/reset-password/verify", async (req: Request, res: Response) => {
  try {
    const { token } = (req.body ?? {}) as { token?: string };
    if (!token) {
      return res.status(400).json({ success: false, error: "Token is required." });
    }

    const secret = getResetJwtSecret();
    const decoded = jwt.verify(token, secret) as { sub?: string; type?: string } | undefined;

    if (!decoded || decoded.type !== "admin-reset" || !decoded.sub) {
      return res.status(400).json({ success: false, error: "Invalid or expired token." });
    }

    return res.json({ success: true, valid: true, username: decoded.sub });
  } catch (_error) {
    return res.status(400).json({ success: false, error: "Invalid or expired token.", valid: false });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = (req.body ?? {}) as {
      token?: string;
      newPassword?: string;
    };

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Token and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long.",
      });
    }

    const secret = getResetJwtSecret();
    const decoded = jwt.verify(token, secret) as { sub?: string; type?: string } | undefined;

    if (!decoded || decoded.type !== "admin-reset" || !decoded.sub) {
      return res.status(400).json({ success: false, error: "Invalid or expired token." });
    }

    const admin = await (prisma as any).admin.findFirst({
      where: { username: decoded.sub },
    });

    if (!admin) {
      return res.status(400).json({ success: false, error: "Invalid token." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await (prisma as any).admin.update({
      where: { username: decoded.sub },
      data: { password: hashed },
    });

    if (updated.email) {
      try {
        await sendAdminPasswordChangedEmail(updated.email);
      } catch (emailError) {
        // eslint-disable-next-line no-console
        console.error("[admin reset-password] Failed to send password changed email", emailError);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to reset password." });
  }
});

router.get("/account", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ success: false, error: "Admin token required." });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { sub?: string; type?: string } | undefined;

    if (!decoded || decoded.type !== "admin" || !decoded.sub) {
      return res.status(401).json({ success: false, error: "Invalid admin token." });
    }

    const admin = await (prisma as any).admin.findFirst({
      where: { username: decoded.sub },
    });

    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found." });
    }

    return res.json({
      username: admin.username,
      email: admin.email,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to load admin account." });
  }
});

router.patch("/account", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ success: false, error: "Admin token required." });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { sub?: string; type?: string } | undefined;

    if (!decoded || decoded.type !== "admin" || !decoded.sub) {
      return res.status(401).json({ success: false, error: "Invalid admin token." });
    }

    const { currentPassword, newPassword, newUsername } = (req.body ?? {}) as {
      currentPassword?: string;
      newPassword?: string;
      newUsername?: string;
    };

    if (!currentPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Current password is required to update account." });
    }

    const admin = await (prisma as any).admin.findFirst({
      where: { username: decoded.sub },
    });

    if (!admin || !admin.password) {
      return res.status(401).json({ success: false, error: "Invalid admin credentials." });
    }

    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok) {
      return res.status(401).json({ success: false, error: "Current password is incorrect." });
    }

    const trimmedUsernameInput = (newUsername ?? "").trim();
    const wantsUsernameChange = !!trimmedUsernameInput;
    const wantsPasswordChange = !!newPassword;

    if (wantsUsernameChange && wantsPasswordChange) {
      return res.status(400).json({
        success: false,
        error:
          "You can change either your username or your password at one time, not both. Please clear one of them and try again.",
      });
    }

    const updateData: Record<string, unknown> = {};
    let usernameChanged = false;
    let passwordChanged = false;

    if (wantsUsernameChange && trimmedUsernameInput !== admin.username) {
      const existing = await (prisma as any).admin.findFirst({
        where: {
          username: trimmedUsernameInput,
          NOT: { username: admin.username },
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ success: false, error: "That username is already taken. Please choose another." });
      }

      updateData.username = trimmedUsernameInput;
      usernameChanged = true;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 8 characters long.",
        });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updateData.password = hashed;
      passwordChanged = true;
    }

    if (!usernameChanged && !passwordChanged) {
      return res.status(400).json({
        success: false,
        error: "No changes provided. Update username and/or password to make changes.",
      });
    }

    const updated = await (prisma as any).admin.update({
      where: { username: admin.username },
      data: updateData,
    });

    let newToken: string | undefined;
    let expiresAt: number | undefined;

    if (usernameChanged) {
      const expiresMs = TWO_HOURS_MS;
      expiresAt = Date.now() + expiresMs;
      newToken = jwt.sign(
        {
          sub: updated.username,
          type: "admin",
        },
        secret,
        { expiresIn: TWO_HOURS_SECONDS }
      );
    }

    if (passwordChanged && updated.email) {
      try {
        await sendAdminPasswordChangedEmail(updated.email);
      } catch (emailError) {
        // eslint-disable-next-line no-console
        console.error("[admin account] Failed to send password changed email", emailError);
      }
    }

    return res.json({ success: true, token: newToken, expiresAt });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to update admin account." });
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

/** PATCH /api/admin/messages/:id/read-status – admin only, toggle read/unread */
router.patch("/messages/:id/read-status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ success: false, error: "Invalid message id." });
    }

    const { isRead } = (req.body ?? {}) as { isRead?: boolean };

    if (typeof isRead !== "boolean") {
      return res
        .status(400)
        .json({ success: false, error: "isRead must be a boolean value." });
    }

    const updated = await (prisma as any).message.update({
      where: { id },
      data: { isRead },
    });

    return res.json({
      success: true,
      id: updated.id,
      isRead: updated.isRead,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ success: false, error: "Message not found." });
    }
    console.error(error);
    return res.status(500).json({ success: false, error: "Failed to update message status." });
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

