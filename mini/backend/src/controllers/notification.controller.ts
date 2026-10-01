import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendNoContent } from "../utils/apiResponse";
import { z } from "zod";
import { notificationService } from "../services/notification.service";

const SendNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(["INFO", "WARNING", "DELAY", "RISK", "TASK", "REQUIREMENT", "MILESTONE", "SYSTEM"]).optional(),
}).strict();
const NotificationQuerySchema = z.object({ unreadOnly: z.enum(["true", "false"]).optional() }).strict();

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { unreadOnly } = NotificationQuerySchema.parse(req.query);
      const notifications = await notificationService.getForUser(req.user.id, unreadOnly === "true");
      sendSuccess(res, notifications);
    } catch (err) { next(err); }
  },

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      sendSuccess(res, { count });
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markRead(req.params.id, req.user.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.user.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  async sendToProject(req: Request, res: Response, next: NextFunction) {
    try {
      const input = SendNotificationSchema.parse(req.body);
      const notifications = await notificationService.createForProjectMembers(
        req.params.projectId,
        req.user.id,
        input.title,
        input.message,
        input.type,
      );
      sendSuccess(res, { sent: notifications.length }, 201);
    } catch (err) { next(err); }
  },
};
