import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || "dev-admin-secret-change-me";
}

/**
 * Guard for /api/admin only. All modifying routes live under /api/admin and require token.
 * - POST /login is public (path is "/login" when mounted at /api/admin).
 * - GET /messages and GET /newsletter-subscriptions require token.
 * - All other methods (POST, PATCH, DELETE) require token.
 */
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  const path = (req.path || "").replace(/^\//, "") || "";
  const normalizedPath = path ? `/${path}` : "/";

  if (method === "OPTIONS") {
    return next();
  }

  // Public: POST /api/admin/login (when mounted at /api/admin, path is "/login")
  if (method === "POST" && (normalizedPath === "/login" || normalizedPath.endsWith("/login"))) {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ success: false, error: "Admin token required." });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { type?: string } | undefined;
    if (!decoded || decoded.type !== "admin") {
      return res.status(401).json({ success: false, error: "Invalid admin token." });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired admin token." });
  }
}

