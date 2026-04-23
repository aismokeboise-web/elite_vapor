import type { Request, Response, NextFunction } from "express";
import prisma from "./prisma";
import type { AuthTokenPayload } from "./auth";

export type PrivilegeOperation = "create" | "update" | "delete" | "reply";

export function requirePrivilege(resource: string, operation: PrivilegeOperation) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as unknown as { authUser?: AuthTokenPayload }).authUser;

    // Admins always have full privileges
    if (user?.role === "admin") {
      return next();
    }

    if (!user || user.role !== "subadmin") {
      return res.status(403).json({ error: "Subadmin privileges required" });
    }

    const privilege = await prisma.privilege.findUnique({
      where: {
        subadminId_resource: {
          subadminId: user.id,
          resource,
        },
      },
    });

    if (!privilege) {
      return res.status(403).json({ error: "No privileges configured for this resource" });
    }

    const allowed =
      (operation === "create" && privilege.canCreate) ||
      (operation === "update" && privilege.canUpdate) ||
      (operation === "delete" && privilege.canDelete) ||
      (operation === "reply" && privilege.canReply);

    if (!allowed) {
      return res.status(403).json({ error: "Operation not allowed for this subadmin" });
    }

    return next();
  };
}

