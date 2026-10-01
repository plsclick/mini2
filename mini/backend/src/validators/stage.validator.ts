import { z } from "zod";

export const CreateStageSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
  plannedStartDate: z.string().datetime().optional(),
  plannedEndDate: z.string().datetime().optional(),
});

export const UpdateStageSchema = CreateStageSchema.partial().extend({
  status: z
    .enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
});

export type CreateStageInput = z.infer<typeof CreateStageSchema>;
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;
