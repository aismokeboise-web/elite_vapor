import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../prisma";
import {
  signAuthToken,
  authMiddleware,
  requireAdmin,
  requireSubadmin,
  isStrongPassword,
} from "../auth";
import {
  sendPasswordChangedEmail,
  sendPasswordChangeAlertToAdmin,
  sendPasswordResetEmail,
} from "../email";

export const authRouter = Router();

// Admin login (username or email)
authRouter.post("/admin/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const admin = await prisma.admin.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signAuthToken({ id: admin.id, role: "admin" });
  return res.json({ token });
});

// Subadmin login (username or email) — include privileges for frontend
authRouter.post("/subadmin/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const subadmin = await prisma.subadmin.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    include: { privileges: true },
  });
  if (!subadmin || !subadmin.isActive) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, subadmin.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Mark that this moderator has logged in at least once (so they can use "Forgot password" to change it)
  const updated = await prisma.subadmin.update({
    where: { id: subadmin.id },
    data: { hasLoggedInOnce: true },
    include: { privileges: true },
  });

  const token = signAuthToken({ id: updated.id, role: "subadmin" });
  const privileges = updated.privileges.map((p) => ({
    resource: p.resource,
    canCreate: p.canCreate,
    canUpdate: p.canUpdate,
    canDelete: p.canDelete,
    canReply: p.canReply,
  }));
  return res.json({ token, privileges, hasLoggedInOnce: updated.hasLoggedInOnce });
});

// Current user profile (admin or subadmin)
authRouter.get("/auth/me", authMiddleware, async (req, res) => {
  const authUser = (req as unknown as { authUser?: { id: string; role: string } }).authUser;
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (authUser.role === "admin") {
    const admin = await prisma.admin.findUnique({
      where: { id: authUser.id },
      select: { id: true, username: true, email: true },
    });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    return res.json({ ...admin, role: "admin" });
  }
  const subadmin = await prisma.subadmin.findUnique({
    where: { id: authUser.id },
    select: { id: true, username: true, email: true, isActive: true },
  });
  if (!subadmin || !subadmin.isActive) return res.status(404).json({ error: "User not found" });
  return res.json({ ...subadmin, role: "subadmin" });
});

// Admin update own profile (username, email) — requires password confirmation
authRouter.put(
  "/auth/admin/profile",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    const authUser = (req as unknown as { authUser?: { id: string } }).authUser!;
    const { username, email, password } = req.body ?? {};

    const admin = await prisma.admin.findUnique({
      where: { id: authUser.id },
    });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required to confirm changes" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const updates: { username?: string; email?: string } = {};
    if (typeof username === "string" && username.trim()) {
      updates.username = username.trim();
    }
    if (typeof email === "string" && email.trim()) {
      updates.email = email.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Provide username and/or email to update" });
    }

    try {
      await prisma.admin.update({
        where: { id: authUser.id },
        data: updates,
      });
    } catch (e: unknown) {
      const err = e as { code?: string; meta?: { target?: string[] } };
      if (err?.code === "P2002") {
        const target = err.meta?.target?.[0] ?? "field";
        return res.status(400).json({ error: `That ${target} is already in use` });
      }
      throw e;
    }

    const updated = await prisma.admin.findUnique({
      where: { id: authUser.id },
      select: { id: true, username: true, email: true },
    });
    return res.json({ ...updated, role: "admin" });
  }
);

// Admin change own password
authRouter.put(
  "/auth/admin/change-password",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    const authUser = (req as unknown as { authUser?: { id: string } }).authUser!;
    const { currentPassword, newPassword } = req.body ?? {};

    const admin = await prisma.admin.findUnique({
      where: { id: authUser.id },
    });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one symbol",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: authUser.id },
      data: { password: hashed },
    });

    res.json({ ok: true });

    if (admin.email) {
      sendPasswordChangedEmail(admin.email, "admin").catch((err) =>
        console.error("Failed to send admin password change email", err)
      );
      sendPasswordChangeAlertToAdmin({
        adminEmail: admin.email,
        changedUserEmail: admin.email,
        role: "admin",
      }).catch((err) =>
        console.error("Failed to send admin password change alert", err)
      );
    }
  }
);

// Moderator change password (only after they have logged in at least once; use "Forgot password" in UI when logged in)
authRouter.put(
  "/auth/subadmin/change-password",
  authMiddleware,
  requireSubadmin,
  async (req, res) => {
    const authUser = (req as unknown as { authUser?: { id: string } }).authUser!;
    const { currentPassword, newPassword } = req.body ?? {};

    const subadmin = await prisma.subadmin.findUnique({
      where: { id: authUser.id },
    });
    if (!subadmin || !subadmin.isActive) {
      return res.status(404).json({ error: "Moderator not found" });
    }

    if (!subadmin.hasLoggedInOnce) {
      return res.status(403).json({
        error: "You must log in at least once with the password shared by your admin before you can change it. Use the password they gave you, then use Forgot password to set your own.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    const valid = await bcrypt.compare(currentPassword, subadmin.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one symbol",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.subadmin.update({
      where: { id: authUser.id },
      data: { password: hashed },
      include: { admin: true },
    });

    res.json({ ok: true });

    if (updated.email) {
      sendPasswordChangedEmail(updated.email, "subadmin").catch((err) =>
        console.error("Failed to send subadmin password change email", err)
      );
    }
    sendPasswordChangeAlertToAdmin({
      adminEmail: updated.admin?.email ?? null,
      changedUserEmail: updated.email,
      role: "subadmin",
    }).catch((err) =>
      console.error("Failed to send subadmin password change alert", err)
    );
  }
);

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Request password reset (admin or subadmin)
authRouter.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !String(email).trim()) {
    return res.status(400).json({ error: "email is required" });
  }

  const normalized = String(email).trim().toLowerCase();
  const token = generateResetToken();
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

  // Try admin first
  const admin = await prisma.admin.findUnique({
    where: { email: normalized },
  });

  if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    res.json({ ok: true });

    sendPasswordResetEmail({ to: admin.email, role: "admin", token }).catch((err) =>
      console.error("Failed to send admin password reset email", err)
    );
    return;
  }

  // Then try subadmin
  const subadmin = await prisma.subadmin.findUnique({
    where: { email: normalized },
  });

  if (subadmin) {
    await prisma.subadmin.update({
      where: { id: subadmin.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    res.json({ ok: true });

    sendPasswordResetEmail({ to: subadmin.email, role: "subadmin", token }).catch((err) =>
      console.error("Failed to send subadmin password reset email", err)
    );
    return;
  }

  // Do not leak whether email exists
  return res.json({ ok: true });
});

// Complete password reset with token
authRouter.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body ?? {};

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "token is required" });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "password is required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one symbol",
    });
  }

  const now = new Date();

  // Try admin token
  const admin = await prisma.admin.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: now },
    },
  });

  if (admin) {
    const hashed = await bcrypt.hash(password, 10);
    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ ok: true });

    sendPasswordChangedEmail(updated.email, "admin").catch((err) =>
      console.error("Failed to send admin password reset email", err)
    );
    sendPasswordChangeAlertToAdmin({
      adminEmail: updated.email,
      changedUserEmail: updated.email,
      role: "admin",
    }).catch((err) =>
      console.error("Failed to send admin password reset alert", err)
    );
    return;
  }

  // Try subadmin token
  const subadmin = await prisma.subadmin.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: now },
    },
    include: { admin: true },
  });

  if (!subadmin) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const updatedSub = await prisma.subadmin.update({
    where: { id: subadmin.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
      hasLoggedInOnce: true,
    },
    include: { admin: true },
  });

  res.json({ ok: true });

  sendPasswordChangedEmail(updatedSub.email, "subadmin").catch((err) =>
    console.error("Failed to send subadmin password reset email", err)
  );
  sendPasswordChangeAlertToAdmin({
    adminEmail: updatedSub.admin?.email ?? null,
    changedUserEmail: updatedSub.email,
    role: "subadmin",
  }).catch((err) =>
    console.error("Failed to send subadmin password reset alert", err)
  );
});

// Admin-only routes for managing subadmins and privileges
authRouter.post("/admin/subadmins", authMiddleware, requireAdmin, async (req, res) => {
  const { username, email, password, privileges } = req.body ?? {};
  const authUser = (req as unknown as { authUser?: { id: string } }).authUser;
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email and password are required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one symbol",
    });
  }

  const hashed = await bcrypt.hash(password, 10);

  const subadmin = await prisma.subadmin.create({
    data: {
      username,
      email,
      password: hashed,
      adminId: authUser.id,
    },
  });

  if (Array.isArray(privileges)) {
    for (const p of privileges) {
      if (!p?.resource) continue;
      await prisma.privilege.upsert({
        where: {
          subadminId_resource: {
            subadminId: subadmin.id,
            resource: p.resource,
          },
        },
        create: {
          subadminId: subadmin.id,
          resource: p.resource,
          canCreate: !!p.canCreate,
          canUpdate: !!p.canUpdate,
          canDelete: !!p.canDelete,
          canReply: !!p.canReply,
        },
        update: {
          canCreate: !!p.canCreate,
          canUpdate: !!p.canUpdate,
          canDelete: !!p.canDelete,
          canReply: !!p.canReply,
        },
      });
    }
  }

  return res.status(201).json({ id: subadmin.id });
});

authRouter.put("/admin/subadmins/:id/privileges", authMiddleware, requireAdmin, async (req, res) => {
  const subadminId = req.params.id as string;
  const { privileges } = req.body ?? {};

  const subadmin = await prisma.subadmin.findUnique({ where: { id: subadminId } });
  if (!subadmin) {
    return res.status(404).json({ error: "Subadmin not found" });
  }

  if (!Array.isArray(privileges)) {
    return res.status(400).json({ error: "privileges must be an array" });
  }

  for (const p of privileges) {
    if (!p?.resource) continue;
    await prisma.privilege.upsert({
      where: {
        subadminId_resource: {
          subadminId,
          resource: p.resource,
        },
      },
      create: {
        subadminId,
        resource: p.resource,
        canCreate: !!p.canCreate,
        canUpdate: !!p.canUpdate,
        canDelete: !!p.canDelete,
        canReply: !!p.canReply,
      },
      update: {
        canCreate: !!p.canCreate,
        canUpdate: !!p.canUpdate,
        canDelete: !!p.canDelete,
        canReply: !!p.canReply,
      },
    });
  }

  return res.json({ ok: true });
});

authRouter.put("/admin/subadmins/:id", authMiddleware, requireAdmin, async (req, res) => {
  const subadminId = req.params.id as string;
  const { username, email, isActive, newPassword } = req.body ?? {};

  const subadmin = await prisma.subadmin.findUnique({ where: { id: subadminId } });
  if (!subadmin) {
    return res.status(404).json({ error: "Subadmin not found" });
  }

  const updates: { username?: string; email?: string; isActive?: boolean; password?: string } = {};
  if (typeof username === "string" && username.trim()) {
    updates.username = username.trim();
  }
  if (typeof email === "string" && email.trim()) {
    updates.email = email.trim();
  }
  if (typeof isActive === "boolean") {
    updates.isActive = isActive;
  }
  if (typeof newPassword === "string" && newPassword.length > 0) {
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one symbol",
      });
    }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Provide at least one field to update" });
  }

  try {
    await prisma.subadmin.update({
      where: { id: subadminId },
      data: updates,
    });
  } catch (e: unknown) {
    const err = e as { code?: string; meta?: { target?: string[] } };
    if (err?.code === "P2002") {
      const target = err.meta?.target?.[0] ?? "field";
      return res.status(400).json({ error: `That ${target} is already in use` });
    }
    throw e;
  }

  return res.json({ ok: true });
});

authRouter.delete("/admin/subadmins/:id", authMiddleware, requireAdmin, async (req, res) => {
  const subadminId = req.params.id as string;

  const subadmin = await prisma.subadmin.findUnique({ where: { id: subadminId } });
  if (!subadmin) {
    return res.status(404).json({ error: "Subadmin not found" });
  }

  await prisma.subadmin.update({
    where: { id: subadminId },
    data: { isActive: false },
  });

  return res.json({ ok: true });
});

// Admin-only read endpoints for subadmins and privileges
authRouter.get("/admin/subadmins", authMiddleware, requireAdmin, async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const subadmins = await prisma.subadmin.findMany({
    where,
    include: {
      privileges: true,
    },
    orderBy: { username: "asc" },
  });
  return res.json(subadmins);
});

authRouter.get("/admin/subadmins/:id", authMiddleware, requireAdmin, async (req, res) => {
  const id = req.params.id as string;
  const subadmin = await prisma.subadmin.findUnique({
    where: { id },
    include: {
      privileges: true,
      admin: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  if (!subadmin) {
    return res.status(404).json({ error: "Subadmin not found" });
  }

  return res.json(subadmin);
});

authRouter.get("/admin/subadmins/:id/privileges", authMiddleware, requireAdmin, async (req, res) => {
  const id = req.params.id as string;

  const privileges = await prisma.privilege.findMany({
    where: { subadminId: id },
    orderBy: { resource: "asc" },
  });

  return res.json(privileges);
});

