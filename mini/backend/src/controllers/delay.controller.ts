import { Request, Response, NextFunction } from "express";
import { delayService } from "../services/delay.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import {
  ConstructionManagerUpdateDelaySchema,
  CreateDelaySchema,
  DelayQuerySchema,
  UpdateDelaySchema,
} from "../validators/delay.validator";
import { sendSuccess, sendCreated } from "../utils/apiResponse";
import { emitScheduleUpdated, getIO } from "../websocket/socket";

export const delayController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = DelayQuerySchema.parse(req.query);
      const delays = await delayService.listForProject(req.params.projectId, filters);
      sendSuccess(res, delays);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const delay = await delayService.getById(req.params.id);
      sendSuccess(res, delay);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateDelaySchema.parse(req.body);
      const delay = await delayService.create(req.params.projectId, req.user.id, input);

      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "DELAY_REPORTED",
        entityType: "Delay",
        entityId: delay.id,
        description: `${req.user.role.replaceAll("_", " ")} reported a ${delay.delayDays}-day delay on ${delay.task?.name ?? "a project task"} due to ${delay.reason}.`,
        metadata: { severity: delay.severity, delayDays: delay.delayDays },
      });

      await notificationService.createForProjectMembers(
        req.params.projectId,
        req.user.id,
        "Delay reported",
        `A ${delay.severity.toLowerCase()} severity delay has been reported: ${delay.reason}`,
        "DELAY",
      );

      getIO().to(`project:${req.params.projectId}`).emit("delay:reported", delay);
      emitScheduleUpdated(req.params.projectId, "DELAY_REPORTED");
      sendCreated(res, delay);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await delayService.getById(req.params.id);
      const schema = req.user.role === "CONSTRUCTION_MANAGER"
        ? ConstructionManagerUpdateDelaySchema
        : UpdateDelaySchema;
      const input = schema.parse(req.body);
      const delay = await delayService.update(req.params.projectId, req.params.id, input);
      const resolved = existing.status !== "RESOLVED" && delay.status === "RESOLVED";
      const action = resolved ? "DELAY_RESOLVED" : "DELAY_UPDATED";
      await activityService.log({
        projectId: delay.projectId,
        userId: req.user.id,
        action,
        entityType: "Delay",
        entityId: delay.id,
        description: resolved
          ? `Resolved ${delay.delayDays}-day delay on ${delay.task?.name ?? "project task"}: ${delay.reason}`
          : `Updated delay on ${delay.task?.name ?? "project task"}: ${delay.reason}`,
        metadata: { status: delay.status, delayDays: delay.delayDays, severity: delay.severity },
      });
      getIO().to(`project:${delay.projectId}`).emit(resolved ? "delay:resolved" : "delay:updated", delay);
      if (input.delayDays !== undefined || ("status" in input && input.status !== undefined)) {
        emitScheduleUpdated(delay.projectId, resolved ? "DELAY_RESOLVED" : "DELAY_UPDATED");
      }
      sendSuccess(res, delay);
    } catch (err) { next(err); }
  },
};
