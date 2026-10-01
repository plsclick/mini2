import { Request, Response, NextFunction } from "express";
import { milestoneService } from "../services/milestone.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import { z } from "zod";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { getIO } from "../websocket/socket";

const MilestoneSchema = z.object({
  taskId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  plannedDate: z.string().datetime().optional(),
  actualDate: z.string().datetime().optional(),
  status: z.enum(["PENDING","ACHIEVED","MISSED","CANCELLED"]).optional(),
});

export const milestoneController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const milestones = await milestoneService.listForProject(req.params.projectId);
      sendSuccess(res, milestones);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const m = await milestoneService.getById(req.params.id);
      sendSuccess(res, m);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = MilestoneSchema.parse(req.body);
      const m = await milestoneService.create(req.params.projectId, input);
      sendCreated(res, m);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = MilestoneSchema.partial().parse(req.body);
      const m = await milestoneService.update(req.params.id, input);

      if (input.status === "ACHIEVED") {
        await activityService.log({
          projectId: m.projectId,
          userId: req.user.id,
          action: "MILESTONE_COMPLETED",
          entityType: "Milestone",
          entityId: m.id,
          description: `Milestone "${m.name}" was achieved`,
        });
        await notificationService.createForProjectMembers(
          m.projectId,
          req.user.id,
          "Milestone achieved",
          `Milestone "${m.name}" has been achieved`,
          "MILESTONE",
        );
        getIO().to(`project:${m.projectId}`).emit("project:updated", { milestone: m });
      }
      sendSuccess(res, m);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await milestoneService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
