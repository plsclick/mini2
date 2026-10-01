import { Request, Response, NextFunction } from "express";
import { recoveryService } from "../services/recovery.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import { z } from "zod";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";

const RecoveryPlanSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  reason: z.string().max(1000).optional(),
  status: z.enum(["PROPOSED","APPROVED","IN_PROGRESS","COMPLETED","REJECTED"]).optional(),
  estimatedDaysRecovered: z.number().min(0).optional(),
});

export const recoveryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await recoveryService.listForProject(req.params.projectId);
      sendSuccess(res, plans);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await recoveryService.getById(req.params.id);
      sendSuccess(res, p);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RecoveryPlanSchema.parse(req.body);
      const p = await recoveryService.create(req.params.projectId, req.user.id, input);
      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "RECOVERY_PLAN_CREATED",
        entityType: "RecoveryPlan",
        entityId: p.id,
        description: `Recovery plan "${p.title}" was created`,
      });
      await notificationService.createForProjectMembers(
        req.params.projectId,
        req.user.id,
        "Recovery plan created",
        `A new recovery plan has been created: ${p.title}`,
        "INFO",
      );
      sendCreated(res, p);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RecoveryPlanSchema.partial().parse(req.body);
      const p = await recoveryService.update(req.params.id, input);
      sendSuccess(res, p);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await recoveryService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
