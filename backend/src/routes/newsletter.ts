import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";
import { sendNewsletterWelcomeEmail } from "../email";

export const newsletterRouter = Router();

// Public: subscribe (create with active: true)
newsletterRouter.post("/", async (req, res) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !String(email).trim()) {
    return res.status(400).json({ error: "email is required" });
  }

  const trimmed = String(email).trim().toLowerCase();

  try {
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: trimmed },
      create: { email: trimmed, active: true },
      update: { active: true },
    });

    res.status(201).json(subscription);

    sendNewsletterWelcomeEmail(subscription.email, subscription.unsubscribeToken).catch((err) => {
      console.error("Failed to send newsletter welcome email", err);
    });
    return;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Email already subscribed" });
    }
    throw e;
  }
});

// Public: unsubscribe by email (legacy, sets active to false)
newsletterRouter.post("/unsubscribe", async (req, res) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !String(email).trim()) {
    return res.status(400).json({ error: "email is required" });
  }

  const trimmed = String(email).trim().toLowerCase();

  const updated = await prisma.newsletterSubscription.updateMany({
    where: { email: trimmed },
    data: { active: false },
  });

  if (updated.count === 0) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  return res.json({ ok: true, message: "Unsubscribed" });
});

// Public: unsubscribe via token link in email
newsletterRouter.get("/unsubscribe/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({ status: "invalid", message: "Invalid unsubscribe link." });
  }

  const existing = await prisma.newsletterSubscription.findFirst({
    where: { unsubscribeToken: token },
  });

  if (!existing) {
    return res.status(404).json({
      status: "not_found",
      message: "We couldn't find a subscription for this link.",
    });
  }

  if (!existing.active) {
    return res.status(200).json({
      status: "already_unsubscribed",
      message: "This email is already unsubscribed from the Elite Vapor newsletter.",
    });
  }

  await prisma.newsletterSubscription.updateMany({
    where: { unsubscribeToken: token },
    data: { active: false },
  });

  return res.status(200).json({
    status: "success",
    message: "You have been unsubscribed from the Elite Vapor newsletter.",
  });
});

// List subscriptions (auth: admin or subadmin)
newsletterRouter.get("/", authMiddleware, async (req, res) => {
  const list = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(list);
});

// Get one subscription (auth)
newsletterRouter.get("/:id", authMiddleware, async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid subscription id" });
  }

  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  return res.json(subscription);
});

// Update subscription (e.g. set active) — requires newsletter update privilege
newsletterRouter.patch(
  "/:id",
  authMiddleware,
  requirePrivilege("newsletter", "update"),
  async (req, res) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid subscription id" });
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const { active, email } = req.body ?? {};

    const data: { active?: boolean; email?: string } = {};
    if (typeof active === "boolean") data.active = active;
    if (email != null && String(email).trim()) data.email = String(email).trim().toLowerCase();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Provide at least one field to update" });
    }

    try {
      const updated = await prisma.newsletterSubscription.update({
        where: { id },
        data,
      });
      return res.json(updated);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "P2002") {
        return res.status(400).json({ error: "Email already in use" });
      }
      throw e;
    }
  }
);

// Toggle active to false (unsubscribe from manage panel) — requires newsletter update privilege
newsletterRouter.post(
  "/:id/unsubscribe",
  authMiddleware,
  requirePrivilege("newsletter", "update"),
  async (req, res) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid subscription id" });
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const updated = await prisma.newsletterSubscription.update({
      where: { id },
      data: { active: false },
    });

    return res.json(updated);
  }
);

// Delete subscription — requires newsletter delete privilege
newsletterRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("newsletter", "delete"),
  async (req, res) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid subscription id" });
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    await prisma.newsletterSubscription.delete({ where: { id } });
    return res.status(204).send();
  }
);
