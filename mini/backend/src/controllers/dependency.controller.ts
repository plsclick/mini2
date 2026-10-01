import { Request, Response, NextFunction } from "express";
import { dependencyService } from "../services/dependency.service";
import { CreateDependencySchema } from "../validators/dependency.validator";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse";
import { emitScheduleUpdated } from "../websocket/socket";

export const dependencyController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const deps = await dependencyService.listForProject(req.params.projectId);
      sendSuccess(res, deps);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateDependencySchema.parse(req.body);
      const dep = await dependencyService.create(req.params.projectId, input);
      emitScheduleUpdated(req.params.projectId, "dependency-created");
      sendCreated(res, dep);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const dep = await dependencyService.delete(req.params.id);
      emitScheduleUpdated(dep.projectId, "dependency-deleted");
      sendNoContent(res);
    } catch (err) { next(err); }
  },
};
