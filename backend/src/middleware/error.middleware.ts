import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";
import { env } from "../config/env";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (status === 400 || status === 413) {
      res.status(status).json({
        success: false,
        error: {
          code: status === 413 ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
          message: status === 413 ? "Request body is too large" : "Malformed request body",
        },
      });
      return;
    }
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A record with that value already exists",
        },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Record not found" },
      });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        error: {
          code: "FOREIGN_KEY_VIOLATION",
          message: "Referenced record does not exist",
        },
      });
      return;
    }
  }

  // Unexpected errors — never expose stack in production
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(env.isDevelopment && err instanceof Error
        ? { detail: err.message }
        : {}),
    },
  });
}
