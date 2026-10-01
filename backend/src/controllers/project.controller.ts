import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { activityService } from "../services/activity.service";
import { notificationService } from "../services/notification.service";
import { CreateProjectSchema, UpdateProjectSchema, AddMemberSchema } from "../validators/project.validator";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { emitScheduleUpdated, getIO } from "../websocket/socket";

export const projectController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.listForUser(req.user.id, req.user.organizationId);
      sendSuccess(res, projects);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getById(req.params.id);
      sendSuccess(res, project);
    } catch (err) { next(err); }
  },

  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await projectService.getDashboard(req.params.id);
      sendSuccess(res, dashboard);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateProjectSchema.parse(req.body);
      const project = await projectService.create(input, req.user.id, req.user.organizationId);
      await activityService.log({
        projectId: project.id,
        userId: req.user.id,
        action: "PROJECT_CREATED",
        entityType: "Project",
        entityId: project.id,
        description: `Project "${project.name}" was created`,
      });
      sendCreated(res, project);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateProjectSchema.parse(req.body);
      const project = await projectService.update(req.params.id, input);
      await activityService.log({
        projectId: project.id,
        userId: req.user.id,
        action: "PROJECT_UPDATED",
        entityType: "Project",
        entityId: project.id,
        description: `Project "${project.name}" was updated`,
        metadata: { changes: Object.keys(input) },
      });
      getIO().to(`project:${project.id}`).emit("project:updated", project);
      if (input.plannedStartDate !== undefined) {
        emitScheduleUpdated(project.id, "project-start-date-updated");
      }
      sendSuccess(res, project);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const input = AddMemberSchema.parse(req.body);
      const member = await projectService.addMember(req.params.id, input);
      await notificationService.create({
        userId: input.userId,
        projectId: req.params.id,
        title: "Added to project",
        message: `You have been added to project "${req.project?.name}"`,
        type: "INFO",
      });
      sendCreated(res, member);
    } catch (err) { next(err); }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.removeMember(req.params.id, req.params.userId, req.user.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
