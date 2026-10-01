import { z } from "zod";

export const CreateDelaySchema = z.object({
  taskId: z.string().uuid(),
  reason: z.string().min(5).max(500),
  description: z.string().max(2000).optional(),
  delayDays: z.number().int().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
}).strict();

export const UpdateDelaySchema = z.object({
  reason: z.string().min(5).max(500).optional(),
  description: z.string().max(2000).optional(),
  delayDays: z.number().int().min(1).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "INVESTIGATING", "RESOLVED"]).optional(),
}).strict().refine((input) => Object.keys(input).length > 0, "At least one delay field must be provided");

export const ConstructionManagerUpdateDelaySchema = z.object({
  reason: z.string().min(5).max(500).optional(),
  description: z.string().max(2000).optional(),
  delayDays: z.number().int().min(1).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
}).strict().refine((input) => Object.keys(input).length > 0, "At least one delay field must be provided");

export const DelayQuerySchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "RESOLVED"]).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  taskId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
}).strict().refine(
  (query) => !query.fromDate || !query.toDate || new Date(query.fromDate) <= new Date(query.toDate),
  { message: "fromDate must be before or equal to toDate", path: ["fromDate"] },
);

export type CreateDelayInput = z.infer<typeof CreateDelaySchema>;
export type UpdateDelayInput = z.infer<typeof UpdateDelaySchema>;
export type ConstructionManagerUpdateDelayInput = z.infer<typeof ConstructionManagerUpdateDelaySchema>;
export type DelayQueryInput = z.infer<typeof DelayQuerySchema>;
