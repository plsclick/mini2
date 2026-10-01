import { Request, Response, NextFunction } from "express";
import { activityService } from "../services/activity.service";
import { sendSuccess } from "../utils/apiResponse";
import { z } from "zod";

const ActivityQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) }).strict();

export const activityController = {
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = ActivityQuerySchema.parse(req.query);
      const activities = await activityService.getForProject(req.params.projectId, limit);
      sendSuccess(res, activities);
    } catch (err) { next(err); }
  },

  async listForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = ActivityQuerySchema.parse(req.query);
      const activities = await activityService.getForUser(req.user.id, limit);
      sendSuccess(res, activities);
    } catch (err) { next(err); }
  },
};
