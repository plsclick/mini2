import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `This action requires one of these roles: ${roles.join(", ")}`,
        ),
      );
      return;
    }
    next();
  };
}
