import { Request, Response, NextFunction } from "express";
import { requirementService } from "../services/requirement.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import { CreateRequirementSchema, UpdateRequirementSchema } from "../validators/requirement.validator";
import { sendSuccess, sendCreated } from "../utils/apiResponse";
import { getIO } from "../websocket/socket";

export const requirementController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const requirements = await requirementService.listForProject(req.params.projectId);
      sendSuccess(res, requirements);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await requirementService.getById(req.params.id);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateRequirementSchema.parse(req.body);
      const r = await requirementService.create(req.params.projectId, req.user.id, input);

      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "REQUIREMENT_SUBMITTED",
        entityType: "Requirement",
        entityId: r.id,
        description: `Requirement "${r.title}" was submitted`,
        metadata: { type: r.type, priority: r.priority },
      });

      await notificationService.createForProjectMembers(
        req.params.projectId,
        req.user.id,
        "New requirement submitted",
        `${r.type} requirement "${r.title}" has been submitted`,
        "REQUIREMENT",
      );

      getIO().to(`project:${req.params.projectId}`).emit("requirement:created", r);
      sendCreated(res, r);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateRequirementSchema.parse(req.body);
      const r = await requirementService.update(req.params.id, input);
      sendSuccess(res, r);
    } catch (err) { next(err); }
  },
};
