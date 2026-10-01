import { z } from "zod";

export const CreateDependencySchema = z
  .object({
    predecessorTaskId: z.string().uuid(),
    successorTaskId: z.string().uuid(),
    dependencyType: z
      .enum([
        "FINISH_TO_START",
        "START_TO_START",
        "FINISH_TO_FINISH",
        "START_TO_FINISH",
      ])
      .optional()
      .default("FINISH_TO_START"),
    lagDays: z.number().int().min(0).optional().default(0),
  })
  .refine((d) => d.predecessorTaskId !== d.successorTaskId, {
    message: "A task cannot depend on itself",
    path: ["successorTaskId"],
  });

export type CreateDependencyInput = z.infer<typeof CreateDependencySchema>;
