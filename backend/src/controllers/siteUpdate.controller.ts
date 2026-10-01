import { Request, Response, NextFunction } from "express";
import { siteUpdateService } from "../services/siteUpdate.service";
import { activityService } from "../services/activity.service";
import { CreateSiteUpdateSchema, UpdateSiteUpdateSchema } from "../validators/siteUpdate.validator";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getIO } from "../websocket/socket";

export const siteUpdateController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = await siteUpdateService.listForProject(req.params.projectId);
      sendSuccess(res, updates);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const u = await siteUpdateService.getById(req.params.id);
      sendSuccess(res, u);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateSiteUpdateSchema.parse(req.body);
      const u = await siteUpdateService.create(req.params.projectId, req.user.id, input);

      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "SITE_UPDATE_CREATED",
        entityType: "SiteUpdate",
        entityId: u.id,
        description: `Site update posted: "${u.title}"`,
        metadata: { progress: u.progress },
      });

      getIO().to(`project:${req.params.projectId}`).emit("site-update:created", u);
      sendCreated(res, u);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateSiteUpdateSchema.parse(req.body);
      const u = await siteUpdateService.update(req.params.id, input);
      sendSuccess(res, u);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await siteUpdateService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
