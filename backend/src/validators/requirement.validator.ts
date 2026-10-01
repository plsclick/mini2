import { z } from "zod";

export const CreateRequirementSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["MATERIAL", "WORKFORCE", "EQUIPMENT", "OTHER"]),
  quantity: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  requiredBy: z.string().datetime().optional(),
});

export const UpdateRequirementSchema = CreateRequirementSchema.partial().extend(
  {
    status: z
      .enum(["PENDING", "APPROVED", "REJECTED", "FULFILLED"])
      .optional(),
  },
);

export type CreateRequirementInput = z.infer<typeof CreateRequirementSchema>;
export type UpdateRequirementInput = z.infer<typeof UpdateRequirementSchema>;
