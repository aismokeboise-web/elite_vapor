import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

router.post("/contact", async (req: Request, res: Response) => {
  const { name, email, subject, message } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedSubject = subject?.trim() ?? "";
  const trimmedMessage = message.trim();

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return res.status(400).json({ success: false, error: "Invalid email address" });
  }

  try {
    const saved = await (prisma as any).message.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject || null,
        message: trimmedMessage,
      },
    });

    return res.json({ success: true, id: saved.id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/newsletter-subscriptions", async (req: Request, res: Response) => {
  const { email } = (req.body ?? {}) as { email?: string };

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  const trimmedEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return res.status(400).json({ success: false, error: "Invalid email address" });
  }

  try {
    const saved = await (prisma as any).newsletterSubscription.upsert({
      where: { email: trimmedEmail },
      update: {},
      create: { email: trimmedEmail },
    });

    return res.json({ success: true, id: saved.id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;

