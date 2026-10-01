import { z } from "zod";

const TaskFieldsSchema = z.object({
  stageId: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  plannedStartDate: z.string().datetime().optional(),
  plannedEndDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).optional(),
  assignedToId: z.string().uuid().optional(),
});

function validatePlannedDateRange(
  value: { plannedStartDate?: string; plannedEndDate?: string },
  context: z.RefinementCtx,
) {
  if (value.plannedStartDate && value.plannedEndDate &&
      new Date(value.plannedEndDate).getTime() < new Date(value.plannedStartDate).getTime()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["plannedEndDate"],
      message: "Planned end date must be on or after planned start date",
    });
  }
}

export const CreateTaskSchema = TaskFieldsSchema.superRefine(validatePlannedDateRange);

export const UpdateTaskSchema = TaskFieldsSchema.partial().extend({
  status: z
    .enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
  actualHours: z.number().min(0).optional(),
}).superRefine(validatePlannedDateRange);

// Construction managers can only update a subset of fields
export const CMUpdateTaskSchema = z.object({
  status: z
    .enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  actualHours: z.number().min(0).optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CMUpdateTaskInput = z.infer<typeof CMUpdateTaskSchema>;
