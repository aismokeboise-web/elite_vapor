"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
router.post("/contact", async (req, res) => {
    const { name, email, subject, message } = (req.body ?? {});
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
        const saved = await prisma_1.default.message.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                subject: trimmedSubject || null,
                message: trimmedMessage,
            },
        });
        return res.json({ success: true, id: saved.id });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});
router.post("/newsletter-subscriptions", async (req, res) => {
    const { email } = (req.body ?? {});
    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
    }
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
        return res.status(400).json({ success: false, error: "Invalid email address" });
    }
    try {
        const saved = await prisma_1.default.newsletterSubscription.upsert({
            where: { email: trimmedEmail },
            update: {},
            create: { email: trimmedEmail },
        });
        return res.json({ success: true, id: saved.id });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});
exports.default = router;
