import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import { CreateTaskSchema, UpdateTaskSchema, CMUpdateTaskSchema } from "../validators/task.validator";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { emitScheduleUpdated, getIO } from "../websocket/socket";
import { z } from "zod";

const TaskQuerySchema = z.object({
  stageId: z.string().uuid().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().uuid().optional(),
}).strict();

export const taskController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = TaskQuerySchema.parse(req.query);
      const tasks = await taskService.listForProject(req.params.projectId, filters);
      sendSuccess(res, tasks);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(req.params.id);
      sendSuccess(res, task);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateTaskSchema.parse(req.body);
      const task = await taskService.create(req.params.projectId, input);
      await activityService.log({
        projectId: req.params.projectId,
        userId: req.user.id,
        action: "TASK_CREATED",
        entityType: "Task",
        entityId: task.id,
        description: `Task "${task.name}" was created`,
      });
      if (task.assignedTo?.id) {
        await notificationService.create({
          userId: task.assignedTo.id,
          projectId: req.params.projectId,
          title: "Task assigned",
          message: `You have been assigned to task: ${task.name}`,
          type: "TASK",
        });
      }
      getIO().to(`project:${req.params.projectId}`).emit("task:updated", task);
      emitScheduleUpdated(req.params.projectId, "task-created");
      sendCreated(res, task);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      // CMs use a restricted update schema
      const schema = req.user.role === "CONSTRUCTION_MANAGER"
        ? CMUpdateTaskSchema
        : UpdateTaskSchema;
      const input = schema.parse(req.body);
      const task = await taskService.update(req.params.id, input);

      const action = task.status === "COMPLETED" ? "TASK_COMPLETED" : "TASK_UPDATED";
      await activityService.log({
        projectId: task.projectId,
        userId: req.user.id,
        action,
        entityType: "Task",
        entityId: task.id,
        description: `Task "${task.name}" was ${task.status === "COMPLETED" ? "completed" : "updated"}`,
        metadata: { changes: Object.keys(input) },
      });

      const eventName = task.status === "COMPLETED" ? "task:completed" : "task:updated";
      getIO().to(`project:${task.projectId}`).emit(eventName, task);
        if (("plannedStartDate" in input && input.plannedStartDate !== undefined) ||
          ("plannedEndDate" in input && input.plannedEndDate !== undefined)) {
        emitScheduleUpdated(task.projectId, "task-dates-updated");
      }
      sendSuccess(res, task);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.delete(req.params.id);
      emitScheduleUpdated(task.projectId, "task-deleted");
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
