import { Response } from "express";

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  const body: ApiError = { success: false, error: { code, message, details } };
  return res.status(statusCode).json(body);
}
