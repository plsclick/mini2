import { z } from "zod";

export const CreateSiteUpdateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  progress: z.number().min(0).max(100).optional(),
  issue: z.string().max(1000).optional(),
});

export const UpdateSiteUpdateSchema = CreateSiteUpdateSchema.partial();

export type CreateSiteUpdateInput = z.infer<typeof CreateSiteUpdateSchema>;
export type UpdateSiteUpdateInput = z.infer<typeof UpdateSiteUpdateSchema>;
