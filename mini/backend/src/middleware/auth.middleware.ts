import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../config/database";
import { UnauthorizedError } from "../utils/errors";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        organizationId: string;
        role: string;
        email: string;
        name: string;
      };
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.slice(7);
    let payload: JwtPayload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        organizationId: true,
        role: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User account not found or disabled");
    }

    req.user = {
      id: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    next(err);
  }
}
