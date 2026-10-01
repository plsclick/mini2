import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  clientId: z.string().uuid().optional(),
  projectManagerId: z.string().uuid().optional(),
  plannedStartDate: z.string().datetime().optional(),
  plannedEndDate: z.string().datetime().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z
    .enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
  actualStartDate: z.string().datetime().optional(),
  actualEndDate: z.string().datetime().optional(),
});

export const AddMemberSchema = z.object({
  userId: z.string().uuid(),
  projectRole: z.enum(["CLIENT", "PROJECT_MANAGER", "CONSTRUCTION_MANAGER"]),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
