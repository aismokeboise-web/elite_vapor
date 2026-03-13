import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export type AuthRole = "admin" | "subadmin";

export interface AuthTokenPayload {
  id: string;
  role: AuthRole;
}

export function isStrongPassword(password: string): boolean {
  if (typeof password !== "string") return false;
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return strongPasswordRegex.test(password);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "You don't have privilege to access this resource. Please check the URL." });
  }

  const token = header.substring("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

    if (decoded.role === "admin") {
      (req as unknown as { authUser: AuthTokenPayload }).authUser = decoded;
      return next();
    }

    if (decoded.role === "subadmin") {
      // Ensure subadmin is still active
      const subadmin = await prisma.subadmin.findUnique({
        where: { id: decoded.id },
        select: { isActive: true },
      });

      if (!subadmin || !subadmin.isActive) {
        return res.status(403).json({ error: "Subadmin is inactive or does not exist" });
      }

      (req as unknown as { authUser: AuthTokenPayload }).authUser = decoded;
      return next();
    }

    return res.status(403).json({ error: "Invalid role" });
  } catch {
    return res
      .status(401)
      .json({ error: "You don't have privilege to access this resource. Please check the URL." });
  }
}

function getAuthUser(req: Request): AuthTokenPayload | undefined {
  return (req as unknown as { authUser?: AuthTokenPayload }).authUser;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(401).json({ error: "Admin privileges required" });
  }
  return next();
}

export function requireSubadmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = getAuthUser(req);
  if (!user || user.role !== "subadmin") {
    return res.status(401).json({ error: "Moderator privileges required" });
  }
  return next();
}

