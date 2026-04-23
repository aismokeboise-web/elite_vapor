import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../auth";
import { requirePrivilege } from "../privileges";
import { sendContactFormConfirmation, sendMessageReplyEmail } from "../email";

export const messagesRouter = Router();

// Public: create message (e.g. contact form)
messagesRouter.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, Email and Message are required" });
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim();
  const trimmedSubject =
    subject != null && String(subject).trim() ? String(subject).trim() : null;
  const trimmedMessage = String(message).trim();

  await prisma.message.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
    },
  });

  try {
    await sendContactFormConfirmation({
      to: trimmedEmail,
      name: trimmedName,
      subject: trimmedSubject,
    });
  } catch (err) {
    console.error("Failed to send contact form confirmation email", err);
  }

  return res.status(201).json({ ok: true });
});

// List messages (auth: admin or subadmin)
messagesRouter.get("/", authMiddleware, async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(messages);
});

// Get one message (auth)
messagesRouter.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid message id" });
  }

  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  return res.json(message);
});

// Reply to message — send email from support in background; set repliedAt only after email is sent successfully
messagesRouter.post(
  "/:id/reply",
  authMiddleware,
  requirePrivilege("message", "reply"),
  async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid message id" });
    }

    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Message not found" });
    }

    const { replyBody } = req.body ?? {};
    const trimmedReply = typeof replyBody === "string" ? replyBody.trim() : "";
    if (!trimmedReply) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    // Respond immediately so the UI doesn't wait on SMTP; send email in background
    res.json({ ok: true });

    sendMessageReplyEmail({
      to: existing.email,
      name: existing.name,
      subject: existing.subject,
      replyBody: trimmedReply,
    })
      .then(() =>
        prisma.message.update({
          where: { id },
          data: { repliedAt: new Date() },
        })
      )
      .catch((err) => {
        console.error("Failed to send message reply email", err);
      });
  }
);

// Delete message — requires message delete privilege
messagesRouter.delete(
  "/:id",
  authMiddleware,
  requirePrivilege("message", "delete"),
  async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid message id" });
    }

    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Message not found" });
    }

    await prisma.message.delete({ where: { id } });
    return res.status(204).send();
  }
);
