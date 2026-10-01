import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../utils/errors";

export function validateRequest(schema: ZodType, target: "body" | "params" | "query") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}

export function validateUuidParam(name: string) {
  return (req: Request, _res: Response, next: NextFunction, value: string): void => {
    const result = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    if (!result) {
      next(new ValidationError([{ field: name, message: "Must be a valid UUID" }]));
      return;
    }
    next();
  };
}